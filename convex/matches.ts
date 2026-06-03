import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listRecent = query({
  args: {
    gameId: v.optional(v.id("games")),
  },
  handler: async (ctx, args) => {
    const matches =
      args.gameId === undefined
        ? await ctx.db.query("matches").order("desc").take(20)
        : await ctx.db
            .query("matches")
            .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId!))
            .order("desc")
            .take(20);

    return await Promise.all(
      matches.map(async (match) => {
        const game = await ctx.db.get(match.gameId);
        const room = await ctx.db.get(match.roomId);
        return { ...match, game, room };
      }),
    );
  },
});

export const start = mutation({
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
      throw new Error("Only the host can start the match.");
    }
    if (room.status !== "open") {
      throw new Error("This room has already started or is closed.");
    }

    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .take(20);

    if (players.length === 0 || players.some((player) => !player.isReady)) {
      throw new Error("Every player must be ready.");
    }

    const now = Date.now();
    const matchId = await ctx.db.insert("matches", {
      gameId: room.gameId,
      roomId: args.roomId,
      status: "started",
      startedAt: now,
      resultData: {
        type: "placeholder",
        message: "Game-specific result data will be attached here later.",
      },
    });

    await ctx.db.patch(args.roomId, {
      status: "in_match",
      updatedAt: now,
    });

    await ctx.db.insert("roomMessages", {
      roomId: args.roomId,
      userId: args.userId,
      authorName: "System",
      body: "Match placeholder started.",
      kind: "system",
      createdAt: now,
    });

    return matchId;
  },
});

export const completePlaceholder = mutation({
  args: {
    matchId: v.id("matches"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    const winner = await ctx.db.get(args.userId);

    if (match === null || winner === null) {
      throw new Error("Match or user was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.matchId, {
      status: "completed",
      endedAt: now,
      winnerUserId: args.userId,
      winnerName: `${winner.name} (Placeholder)`,
      resultData: {
        type: "placeholder",
        winnerUserId: args.userId,
        note: "Real game scoring is intentionally not implemented.",
      },
    });

    await ctx.db.insert("roomMessages", {
      roomId: match.roomId,
      userId: args.userId,
      authorName: "System",
      body: `${winner.name} was recorded as placeholder winner.`,
      kind: "system",
      createdAt: now,
    });
  },
});
