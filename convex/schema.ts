import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    anonymousKey: v.string(),
    name: v.string(),
    avatarColor: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
  }).index("by_anonymousKey", ["anonymousKey"]),

  games: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    minPlayers: v.number(),
    maxPlayers: v.number(),
    defaultSettings: v.any(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  rooms: defineTable({
    gameId: v.id("games"),
    name: v.string(),
    ownerUserId: v.id("users"),
    status: v.union(
      v.literal("open"),
      v.literal("in_match"),
      v.literal("closed"),
    ),
    hasPassword: v.boolean(),
    passwordHash: v.optional(v.string()),
    settings: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_gameId_and_status", ["gameId", "status"])
    .index("by_ownerUserId", ["ownerUserId"]),

  roomPlayers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    displayName: v.string(),
    isReady: v.boolean(),
    isHost: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_userId", ["userId"])
    .index("by_roomId_and_userId", ["roomId", "userId"]),

  roomMessages: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    authorName: v.string(),
    body: v.string(),
    kind: v.union(v.literal("chat"), v.literal("system")),
    createdAt: v.number(),
  }).index("by_roomId_and_createdAt", ["roomId", "createdAt"]),

  matches: defineTable({
    gameId: v.id("games"),
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("started"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    winnerUserId: v.optional(v.id("users")),
    winnerName: v.optional(v.string()),
    resultData: v.any(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_roomId", ["roomId"])
    .index("by_gameId_and_status", ["gameId", "status"]),
});
