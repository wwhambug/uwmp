import Link from "next/link";
import { ArrowRight, History, Layers3, MessageSquare, Users } from "lucide-react";

import { PlayerProfile } from "@/components/player-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const capabilities = [
  {
    icon: Layers3,
    title: "10개 게임 슬롯",
    description: "Bowling, Kart 등 10개 게임을 동일한 플랫폼 계약으로 연결합니다.",
  },
  {
    icon: Users,
    title: "공용 로비",
    description: "방 생성, 참가, 비밀번호, 방장, 준비 상태를 공통 모델로 처리합니다.",
  },
  {
    icon: MessageSquare,
    title: "방 채팅",
    description: "게임 시작 전후의 기본 커뮤니케이션을 방 단위로 제공합니다.",
  },
  {
    icon: History,
    title: "매치 기록",
    description: "모든 매치는 gameId를 포함하고 resultData JSON으로 확장됩니다.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Platform foundation</Badge>
              <Badge variant="outline">Convex powered</Badge>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
                Ultra Wide Multiplayer Platform
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                UWMP는 여러 멀티플레이어 게임을 하나의 로비, 방, 채팅, 매치
                기록 시스템 위에서 서비스하기 위한 공용 플랫폼입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/games">
                  게임 목록 보기
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/games/bowling">Bowling 로비</Link>
              </Button>
            </div>
          </div>

          <PlayerProfile />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-4">
        {capabilities.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-md border bg-secondary">
                <item.icon className="size-5" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="border-t bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle>현재 구현 범위</CardTitle>
              <CardDescription>
                실제 게임 로직, 물리 엔진, 위치 동기화는 의도적으로 제외했습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-md border bg-background p-3">
                <div className="text-muted-foreground">플랫폼 기능</div>
                <div className="mt-1 font-medium">로비, 방, 채팅, 매치 기록</div>
              </div>
              <div className="rounded-md border bg-background p-3">
                <div className="text-muted-foreground">게임 구현</div>
                <div className="mt-1 font-medium">Placeholder only</div>
              </div>
              <div className="rounded-md border bg-background p-3">
                <div className="text-muted-foreground">확장 포인트</div>
                <div className="mt-1 font-medium">settings, resultData JSON</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
