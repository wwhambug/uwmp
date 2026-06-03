import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-3xl place-items-center px-4">
      <div className="grid gap-4 rounded-lg border p-6">
        <div>
          <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            요청한 플랫폼 화면이 존재하지 않습니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/games">게임 목록으로 이동</Link>
        </Button>
      </div>
    </main>
  );
}
