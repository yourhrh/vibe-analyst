import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';

Given('사용자가 {string} 분석 페이지에 접속한다', async ({ page }, ticker: string) => {
  await page.goto(`/analyze/${ticker}`);
});

Then('{string} 티커가 대문자로 표시된다', async ({ page }, ticker: string) => {
  await expect(page.getByRole('heading', { name: ticker })).toBeVisible();
});

Then('{string} 안내가 보인다', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});
