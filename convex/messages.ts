import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByRoom = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roomMessages")
      .withIndex("by_roomId_and_createdAt", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(50);
  },
});

export const send = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    const user = await ctx.db.get(args.userId);

    if (room === null || user === null) {
      throw new Error("Room or user was not found.");
    }

    const membership = await ctx.db
      .query("roomPlayers")
      .withIndex("by_roomId_and_userId", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .unique();

    if (membership === null) {
      throw new Error("Only room players can send messages.");
    }

    const body = args.body.trim().slice(0, 400);
    if (body.length === 0) {
      throw new Error("Message cannot be empty.");
    }

    return await ctx.db.insert("roomMessages", {
      roomId: args.roomId,
      userId: args.userId,
      authorName: user.name,
      body,
      kind: "chat",
      createdAt: Date.now(),
    });
  },
});
