import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const defaultGames = [
  {
    slug: "bowling",
    name: "Bowling",
    description: "Turns, frames, scoreboards, and lane settings can be attached later.",
    minPlayers: 1,
    maxPlayers: 6,
    defaultSettings: {
      mode: "standard",
      frames: 10,
      lane: "classic",
      implementation: "placeholder",
    },
  },
  {
    slug: "kart",
    name: "Kart",
    description: "Track, vehicle, lap, and item settings can be attached later.",
    minPlayers: 2,
    maxPlayers: 8,
    defaultSettings: {
      mode: "race",
      laps: 3,
      track: "prototype",
      implementation: "placeholder",
    },
  },
  {
    slug: "soccer",
    name: "Soccer",
    description: "Team lobby, match timer, and score payloads can be connected later.",
    minPlayers: 2,
    maxPlayers: 10,
    defaultSettings: {
      mode: "team",
      halfMinutes: 5,
      implementation: "placeholder",
    },
  },
  {
    slug: "tennis",
    name: "Tennis",
    description: "Singles or doubles room settings can be expanded without game logic.",
    minPlayers: 2,
    maxPlayers: 4,
    defaultSettings: {
      mode: "singles",
      sets: 3,
      implementation: "placeholder",
    },
  },
  {
    slug: "golf",
    name: "Golf",
    description: "Course, hole count, and scoring result data can be attached later.",
    minPlayers: 1,
    maxPlayers: 4,
    defaultSettings: {
      holes: 9,
      course: "starter",
      implementation: "placeholder",
    },
  },
  {
    slug: "darts",
    name: "Darts",
    description: "Round formats and target rules can live in settings later.",
    minPlayers: 1,
    maxPlayers: 4,
    defaultSettings: {
      mode: "501",
      rounds: 10,
      implementation: "placeholder",
    },
  },
  {
    slug: "pool",
    name: "Pool",
    description: "Table rules, turn order, and winner data are reserved for expansion.",
    minPlayers: 2,
    maxPlayers: 4,
    defaultSettings: {
      mode: "eight-ball",
      table: "standard",
      implementation: "placeholder",
    },
  },
  {
    slug: "arena",
    name: "Arena",
    description: "Generic arena rooms for future real-time game modules.",
    minPlayers: 2,
    maxPlayers: 12,
    defaultSettings: {
      mode: "free-for-all",
      roundMinutes: 6,
      implementation: "placeholder",
    },
  },
  {
    slug: "quiz",
    name: "Quiz",
    description: "Question packs and score summaries can be stored as match result JSON.",
    minPlayers: 1,
    maxPlayers: 16,
    defaultSettings: {
      rounds: 5,
      category: "general",
      implementation: "placeholder",
    },
  },
  {
    slug: "puzzle",
    name: "Puzzle",
    description: "Co-op puzzle sessions can share the platform lobby and match records.",
    minPlayers: 1,
    maxPlayers: 6,
    defaultSettings: {
      mode: "co-op",
      difficulty: "normal",
      implementation: "placeholder",
    },
  },
] as const;

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let inserted = 0;
    let updated = 0;

    for (const game of defaultGames) {
      const existing = await ctx.db
        .query("games")
        .withIndex("by_slug", (q) => q.eq("slug", game.slug))
        .unique();

      if (existing === null) {
        await ctx.db.insert("games", {
          ...game,
          status: "active",
          createdAt: now,
        });
        inserted += 1;
      } else {
        await ctx.db.patch(existing._id, {
          name: game.name,
          description: game.description,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          defaultSettings: game.defaultSettings,
          status: "active",
        });
        updated += 1;
      }
    }

    return { inserted, updated, total: defaultGames.length };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("games").order("asc").take(50);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
