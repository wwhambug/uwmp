"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Lock, Plus, Users } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getLocalPlayer } from "@/lib/player";
import { PlayerProfile } from "@/components/player-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GameLobbyPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const game = useQuery(api.games.getBySlug, { slug: params.slug });
  const rooms = useQuery(
    api.rooms.listByGame,
    game ? { gameId: game._id } : "skip",
  );
  const upsertUser = useMutation(api.users.upsertAnonymous);
  const createRoom = useMutation(api.rooms.create);
  const joinRoom = useMutation(api.rooms.join);

  const localPlayer = useMemo(() => getLocalPlayer(), []);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [joinPasswords, setJoinPasswords] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void upsertUser({
      anonymousKey: localPlayer.key,
      name: localPlayer.name,
      avatarColor: localPlayer.avatarColor,
    }).then(setUserId);
  }, [localPlayer, upsertUser]);

  async function onCreateRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!game || !userId) return;

    setError(null);
    try {
      const roomId = await createRoom({
        gameId: game._id,
        userId,
        displayName: localPlayer.name,
        name: roomName,
        password: password || undefined,
        settings: game.defaultSettings,
      });
      router.push(`/rooms/${roomId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "방 생성에 실패했습니다.");
    }
  }

  async function onJoinRoom(roomId: Id<"rooms">) {
    if (!userId) return;

    setError(null);
    try {
      await joinRoom({
        roomId,
        userId,
        displayName: localPlayer.name,
        password: joinPasswords[roomId] || undefined,
      });
      router.push(`/rooms/${roomId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "방 참가에 실패했습니다.");
    }
  }

  if (game === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-muted-foreground">
        로비를 불러오는 중입니다.
      </main>
    );
  }

  if (game === null) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>게임을 찾을 수 없습니다</CardTitle>
            <CardDescription>
              기본 게임 데이터가 아직 생성되지 않았을 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/games">게임 목록으로 돌아가기</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col justify-center gap-2">
          <Badge variant="secondary" className="w-fit">
            Lobby
          </Badge>
          <h1 className="text-3xl font-semibold">{game.name} 로비</h1>
          <p className="max-w-2xl text-muted-foreground">
            {game.description}
          </p>
        </div>
        <PlayerProfile />
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              방 생성
            </CardTitle>
            <CardDescription>
              게임별 설정은 room.settings JSON에 저장됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onCreateRoom}>
              <div className="grid gap-2">
                <Label htmlFor="roomName">방 이름</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  placeholder={`${game.name} Room`}
                  maxLength={40}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">방 비밀번호 선택</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비워두면 공개 방"
                />
              </div>
              <Button type="submit" disabled={!userId}>
                방 만들기
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {(rooms ?? []).length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>열린 방이 없습니다</CardTitle>
                <CardDescription>
                  새 방을 만들면 이곳에 표시됩니다.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            rooms?.map((room) => (
              <Card key={room._id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-4" />
                          {room.playerCount}명
                        </span>
                        <span>준비 {room.readyCount}명</span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {room.hasPassword ? (
                        <Badge variant="outline">
                          <Lock className="mr-1 size-3" />
                          비밀번호
                        </Badge>
                      ) : null}
                      <Badge variant="secondary">{room.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                  {room.hasPassword ? (
                    <Input
                      type="password"
                      placeholder="방 비밀번호"
                      value={joinPasswords[room._id] ?? ""}
                      onChange={(event) =>
                        setJoinPasswords((current) => ({
                          ...current,
                          [room._id]: event.target.value,
                        }))
                      }
                    />
                  ) : null}
                  <Button onClick={() => void onJoinRoom(room._id)}>
                    참가
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
