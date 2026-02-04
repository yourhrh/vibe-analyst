import type { NewsArticle } from '@/types/financial';

export interface NewsPort {
  getArticles(
    ticker: string,
    opts: { days: number },
  ): Promise<NewsArticle[]>;
}
