export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Vibe Analyst
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          전설적 투자자 6인의 관점으로 미국 주식을 분석합니다
        </p>
        <div className="mt-8">
          {/* F-1: SearchBar will go here */}
        </div>
      </div>
    </main>
  );
}
