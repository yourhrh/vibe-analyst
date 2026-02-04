interface AnalyzePageProps {
  params: Promise<{ ticker: string }>;
}

export default async function AnalyzePage({ params }: AnalyzePageProps) {
  const { ticker } = await params;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">{ticker.toUpperCase()}</h1>
      <p className="mt-2 text-muted-foreground">
        분석 페이지 준비 중
      </p>
    </main>
  );
}
