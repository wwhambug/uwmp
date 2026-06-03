import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  throw new Error("Missing Convex URL.");
}

const client = new ConvexHttpClient(convexUrl);
const games = await client.query(api.games.list, {});
const bowling = games.find((game) => game.slug === "bowling");

if (!bowling) {
  throw new Error("Bowling seed is missing.");
}

if (games.length < 10) {
  throw new Error(`Expected at least 10 games, found ${games.length}.`);
}

const suffix = Date.now().toString(36);
const userId = await client.mutation(api.users.upsertAnonymous, {
  anonymousKey: `qa-${suffix}`,
  name: "Automation QA",
  avatarColor: "blue",
});

const roomId = await client.mutation(api.rooms.create, {
  gameId: bowling._id,
  userId,
  displayName: "Automation QA",
  name: `QA Room ${suffix}`,
  settings: bowling.defaultSettings,
});

await client.mutation(api.messages.send, {
  roomId,
  userId,
  body: "Chat verification message",
});

const messages = await client.query(api.messages.listByRoom, { roomId });
if (!messages.some((message) => message.body === "Chat verification message")) {
  throw new Error("Chat message was not stored.");
}

const matchId = await client.mutation(api.matches.start, {
  roomId,
  userId,
});

await client.mutation(api.matches.completePlaceholder, {
  matchId,
  userId,
});

const details = await client.query(api.rooms.getDetails, { roomId });
const recent = await client.query(api.matches.listRecent, {
  gameId: bowling._id,
});

console.log(
  JSON.stringify(
    {
      games: games.length,
      roomId,
      userId,
      messages: messages.length,
      roomStatus: details?.room.status,
      recentMatches: recent.length,
      verified: true,
    },
    null,
    2,
  ),
);
