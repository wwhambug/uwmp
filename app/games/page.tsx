"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Gamepad2, Trophy } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
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
import { Separator } from "@/components/ui/separator";

export default function GamesPage() {
  const ensureDefaults = useMutation(api.games.ensureDefaults);
  const games = useQuery(api.games.list);
  const recentMatches = useQuery(api.matches.listRecent, {});

  useEffect(() => {
    void ensureDefaults();
  }, [ensureDefaults]);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col justify-center gap-2">
          <Badge variant="secondary" className="w-fit">
            Registered games
          </Badge>
          <h1 className="text-3xl font-semibold">게임 목록</h1>
          <p className="max-w-2xl text-muted-foreground">
            현재는 플랫폼 기능 검증용 게임 슬롯입니다. 플레이 버튼은 로비로
            이동하며 실제 게임 플레이는 구현하지 않습니다.
          </p>
        </div>
        <PlayerProfile />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(games ?? []).map((game) => (
          <Card key={game._id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Gamepad2 className="size-5" />
                    {game.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {game.description}
                  </CardDescription>
                </div>
                <Badge variant="outline">{game.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">최소 인원</div>
                <div className="mt-1 font-medium">{game.minPlayers}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">최대 인원</div>
                <div className="mt-1 font-medium">{game.maxPlayers}</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/games/${game.slug}`}>
                  플레이
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="size-5" />
            <CardTitle>최근 플레이 기록</CardTitle>
          </div>
          <CardDescription>
            승자와 결과 데이터는 실제 게임 로직 연결 전까지 Placeholder로
            기록됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {(recentMatches ?? []).length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              아직 기록된 매치가 없습니다.
            </div>
          ) : (
            recentMatches?.map((match) => (
              <div key={match._id} className="grid gap-2 rounded-md border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">
                    {match.game?.name ?? "Unknown game"} ·{" "}
                    {match.room?.name ?? "Closed room"}
                  </div>
                  <Badge variant="secondary">{match.status}</Badge>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  승자: {match.winnerName ?? "Placeholder"}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
