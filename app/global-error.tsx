"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <main>
          <h1>오류가 발생했습니다</h1>
          <button onClick={reset}>다시 시도</button>
        </main>
      </body>
    </html>
  );
}
