import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const passwordMarker = (password: string) => `local:${password}`;

export const listByGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_gameId_and_status", (q) =>
        q.eq("gameId", args.gameId).eq("status", "open"),
      )
      .order("desc")
      .take(50);

    return await Promise.all(
      rooms.map(async (room) => {
        const players = await ctx.db
          .query("roomPlayers")
          .withIndex("by_roomId", (q) => q.eq("roomId", room._id))
          .take(20);

        return {
          ...room,
          playerCount: players.length,
          readyCount: players.filter((player) => player.isReady).length,
        };
      }),
    );
  },
});

export const getDetails = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (room === null) {
      return null;
    }

    const game = await ctx.db.get(room.gameId);
    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("asc")
      .take(20);

    const activeMatch = await ctx.db
      .query("matches")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(1);

    return {
      room,
      game,
      players,
      activeMatch: activeMatch[0] ?? null,
    };
  },
});

export const create = mutation({
  args: {
    gameId: v.id("games"),
    userId: v.id("users"),
    displayName: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    const owner = await ctx.db.get(args.userId);

    if (game === null || owner === null) {
      throw new Error("Game or user was not found.");
    }

    const now = Date.now();
    const roomId = await ctx.db.insert("rooms", {
      gameId: args.gameId,
      name: args.name.trim().slice(0, 40) || `${game.name} Room`,
      ownerUserId: args.userId,
      status: "open",
      hasPassword: Boolean(args.password),
      passwordHash: args.password ? passwordMarker(args.password) : undefined,
      settings: args.settings,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("roomPlayers", {
      roomId,
      userId: args.userId,
      displayName: args.displayName,
      isReady: true,
      isHost: true,
      joinedAt: now,
    });

    await ctx.db.insert("roomMessages", {
      roomId,
      userId: args.userId,
      authorName: "System",
      body: `${args.displayName} created the room.`,
      kind: "system",
      createdAt: now,
    });

    return roomId;
  },
});

export const join = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    displayName: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    const user = await ctx.db.get(args.userId);

    if (room === null || user === null) {
      throw new Error("Room or user was not found.");
    }

    if (room.status !== "open") {
      throw new Error("This room is not open.");
    }

    if (
      room.hasPassword &&
      room.passwordHash !== passwordMarker(args.password ?? "")
    ) {
      throw new Error("Room password is incorrect.");
    }

    const existing = await ctx.db
      .query("roomPlayers")
      .withIndex("by_roomId_and_userId", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .unique();

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
      });
      return args.roomId;
    }

    const now = Date.now();
    await ctx.db.insert("roomPlayers", {
      roomId: args.roomId,
      userId: args.userId,
      displayName: args.displayName,
      isReady: false,
      isHost: false,
      joinedAt: now,
    });

    await ctx.db.insert("roomMessages", {
      roomId: args.roomId,
      userId: args.userId,
      authorName: "System",
      body: `${args.displayName} joined the room.`,
      kind: "system",
      createdAt: now,
    });

    return args.roomId;
  },
});

export const setReady = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    isReady: v.boolean(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("roomPlayers")
      .withIndex("by_roomId_and_userId", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .unique();

    if (player === null) {
      throw new Error("You are not in this room.");
    }

    await ctx.db.patch(player._id, { isReady: args.isReady });

    await ctx.db.insert("roomMessages", {
      roomId: args.roomId,
      userId: args.userId,
      authorName: "System",
      body: `${player.displayName} is ${args.isReady ? "ready" : "not ready"}.`,
      kind: "system",
      createdAt: Date.now(),
    });

    return player._id;
  },
});

export const close = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (room === null) {
      throw new Error("Room was not found.");
    }
    if (room.ownerUserId !== args.userId) {
      throw new Error("Only the host can close the room.");
    }

    await ctx.db.patch(args.roomId, {
      status: "closed",
      updatedAt: Date.now(),
    });
  },
});
