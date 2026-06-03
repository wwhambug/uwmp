import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByAnonymousKey = query({
  args: {
    anonymousKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_anonymousKey", (q) =>
        q.eq("anonymousKey", args.anonymousKey),
      )
      .unique();
  },
});

export const upsertAnonymous = mutation({
  args: {
    anonymousKey: v.string(),
    name: v.string(),
    avatarColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cleanName = args.name.trim().slice(0, 32) || "Player";
    const existing = await ctx.db
      .query("users")
      .withIndex("by_anonymousKey", (q) =>
        q.eq("anonymousKey", args.anonymousKey),
      )
      .unique();

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        name: cleanName,
        avatarColor: args.avatarColor ?? existing.avatarColor,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      anonymousKey: args.anonymousKey,
      name: cleanName,
      avatarColor: args.avatarColor,
      createdAt: now,
      lastSeenAt: now,
    });
  },
});
