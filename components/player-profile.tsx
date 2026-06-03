"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { getLocalPlayer, saveLocalPlayerName } from "@/lib/player";
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
import { Label } from "@/components/ui/label";

export function PlayerProfile() {
  const localPlayer = useMemo(() => getLocalPlayer(), []);
  const user = useQuery(api.users.getByAnonymousKey, {
    anonymousKey: localPlayer.key,
  });
  const upsertUser = useMutation(api.users.upsertAnonymous);
  const [name, setName] = useState(localPlayer.name);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void upsertUser({
      anonymousKey: localPlayer.key,
      name: localPlayer.name,
      avatarColor: localPlayer.avatarColor,
    });
  }, [localPlayer, upsertUser]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveLocalPlayerName(name);
    await upsertUser({
      anonymousKey: localPlayer.key,
      name,
      avatarColor: localPlayer.avatarColor,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5" />
              게스트 로그인
            </CardTitle>
            <CardDescription>
              별도 인증 전까지 로컬 게스트 계정으로 로비를 테스트합니다.
            </CardDescription>
          </div>
          <Badge variant={user ? "default" : "outline"}>
            {user ? "연결됨" : "대기"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="playerName">표시 이름</Label>
            <Input
              id="playerName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={32}
              placeholder="Player"
            />
          </div>
          <Button type="submit" variant="outline">
            {saved ? "저장됨" : "프로필 저장"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
