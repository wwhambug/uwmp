"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Crown,
  MessageSquare,
  Play,
  Send,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getLocalPlayer } from "@/lib/player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId as Id<"rooms">;
  const localPlayer = useMemo(() => getLocalPlayer(), []);
  const details = useQuery(api.rooms.getDetails, { roomId });
  const messages = useQuery(api.messages.listByRoom, { roomId });
  const recentMatches = useQuery(
    api.matches.listRecent,
    details?.room ? { gameId: details.room.gameId } : "skip",
  );
  const upsertUser = useMutation(api.users.upsertAnonymous);
  const setReady = useMutation(api.rooms.setReady);
  const startMatch = useMutation(api.matches.start);
  const completePlaceholder = useMutation(api.matches.completePlaceholder);
  const sendMessage = useMutation(api.messages.send);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [chatBody, setChatBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void upsertUser({
      anonymousKey: localPlayer.key,
      name: localPlayer.name,
      avatarColor: localPlayer.avatarColor,
    }).then(setUserId);
  }, [localPlayer, upsertUser]);

  const currentPlayer = details?.players.find(
    (player) => player.userId === userId,
  );
  const isHost = details?.room.ownerUserId === userId;
  const allReady =
    details !== undefined &&
    details !== null &&
    details.players.length > 0 &&
    details.players.every((player) => player.isReady);

  async function toggleReady() {
    if (!userId || !currentPlayer) return;
    setError(null);
    try {
      await setReady({
        roomId,
        userId,
        isReady: !currentPlayer.isReady,
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "준비 상태 변경에 실패했습니다.",
      );
    }
  }

  async function onStartMatch() {
    if (!userId) return;
    setError(null);
    try {
      await startMatch({ roomId, userId });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "매치 시작에 실패했습니다.");
    }
  }

  async function onCompletePlaceholder() {
    if (!userId || !details?.activeMatch) return;
    setError(null);
    try {
      await completePlaceholder({
        matchId: details.activeMatch._id,
        userId,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "매치 기록에 실패했습니다.");
    }
  }

  async function onSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || chatBody.trim().length === 0) return;
    setError(null);
    try {
      await sendMessage({ roomId, userId, body: chatBody });
      setChatBody("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "메시지 전송에 실패했습니다.");
    }
  }

  if (details === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-muted-foreground">
        방 정보를 불러오는 중입니다.
      </main>
    );
  }

  if (details === null) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>방을 찾을 수 없습니다</CardTitle>
            <CardDescription>
              닫혔거나 존재하지 않는 방입니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const orderedMessages = [...(messages ?? [])].reverse();

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{details.game?.name ?? "Game"}</Badge>
          <Badge variant="outline">{details.room.status}</Badge>
          {details.room.hasPassword ? <Badge variant="outline">비공개</Badge> : null}
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold">{details.room.name}</h1>
            <p className="mt-2 text-muted-foreground">
              방장, 플레이어 준비 상태, 채팅, 매치 Placeholder 상태를 확인합니다.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/games/${details.game?.slug ?? ""}`}>로비로 이동</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              플레이어 목록
            </CardTitle>
            <CardDescription>
              방장은 왕관으로 표시되고 준비 상태는 실시간으로 반영됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {details.players.map((player) => (
              <div
                key={player._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-secondary font-medium">
                    {player.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {player.displayName}
                      {player.isHost ? <Crown className="size-4" /> : null}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.isHost ? "방장" : "참가자"}
                    </div>
                  </div>
                </div>
                <Badge variant={player.isReady ? "default" : "outline"}>
                  {player.isReady ? "준비 완료" : "대기 중"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5" />
                로비 제어
              </CardTitle>
              <CardDescription>
                시작 버튼은 실제 게임 대신 match Placeholder를 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                variant={currentPlayer?.isReady ? "outline" : "default"}
                onClick={() => void toggleReady()}
                disabled={!currentPlayer || details.room.status !== "open"}
              >
                {currentPlayer?.isReady ? "준비 취소" : "준비 완료"}
              </Button>
              <Button
                onClick={() => void onStartMatch()}
                disabled={!isHost || !allReady || details.room.status !== "open"}
              >
                <Play />
                시작
              </Button>
              <Separator />
              <div className="text-sm text-muted-foreground">
                시작 조건: 방장 권한과 모든 플레이어 준비 완료.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>매치 Placeholder</CardTitle>
              <CardDescription>
                게임별 실행 화면 없이 매치 상태만 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {details.activeMatch ? (
                <>
                  <div className="rounded-md border p-4 text-sm">
                    현재 매치 상태:{" "}
                    <span className="font-medium">
                      {details.activeMatch.status}
                    </span>
                  </div>
                  {details.activeMatch.status === "started" ? (
                    <Button
                      variant="outline"
                      onClick={() => void onCompletePlaceholder()}
                    >
                      Placeholder 승자 기록
                    </Button>
                  ) : null}
                </>
              ) : (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  아직 시작된 매치가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              방 채팅
            </CardTitle>
            <CardDescription>
              로비와 매치 Placeholder 상태를 공유하는 기본 채팅입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid max-h-80 gap-2 overflow-y-auto rounded-md border p-3">
              {orderedMessages.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  아직 메시지가 없습니다.
                </div>
              ) : (
                orderedMessages.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.kind === "system"
                        ? "rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground"
                        : "rounded-md border px-3 py-2 text-sm"
                    }
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-medium">{message.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>{message.body}</div>
                  </div>
                ))
              )}
            </div>
            <form className="flex gap-2" onSubmit={onSendMessage}>
              <Input
                value={chatBody}
                onChange={(event) => setChatBody(event.target.value)}
                placeholder="메시지 입력"
                maxLength={400}
                disabled={!currentPlayer}
              />
              <Button type="submit" size="icon" disabled={!currentPlayer}>
                <Send />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5" />
              매치 기록
            </CardTitle>
            <CardDescription>
              match.resultData는 게임별 결과 JSON 확장을 위해 열려 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(recentMatches ?? []).length === 0 ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                최근 플레이 기록이 없습니다.
              </div>
            ) : (
              recentMatches?.map((match) => (
                <div key={match._id} className="rounded-md border p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="font-medium">
                      {match.room?.name ?? "Room"} · {match.status}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      승자: {match.winnerName ?? "Placeholder"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
