import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';

Given('사용자가 홈 화면에 접속한다', async ({ page }) => {
  await page.goto('/');
});

Then('{string} 제목이 보인다', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});

Then('{string} 설명이 보인다', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});
