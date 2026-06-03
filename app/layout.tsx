import Link from "next/link";
import { Gamepad2 } from "lucide-react";

import "./globals.css";
import { ConvexClientProvider } from "./providers";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background antialiased">
        <ConvexClientProvider>
          <div className="min-h-screen">
            <header className="border-b bg-background/95">
              <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <span className="flex size-9 items-center justify-center rounded-md border bg-card">
                    <Gamepad2 className="size-5" />
                  </span>
                  <span>UWMP</span>
                </Link>
                <nav className="flex items-center gap-2">
                  <Button asChild variant="ghost">
                    <Link href="/games">게임 목록</Link>
                  </Button>
                </nav>
              </div>
            </header>
            {children}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
