import type { Meta, StoryObj } from '@storybook/react';
import { VerdictBadge } from './verdict-badge';

const meta = {
  title: 'Design System/VerdictBadge',
  component: VerdictBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    verdict: {
      control: 'select',
      options: ['강력매수', '매수고려', '관망', '매수부적합'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof VerdictBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StrongBuy: Story = {
  name: '강력매수 (Gold)',
  args: {
    verdict: '강력매수',
    size: 'md',
  },
};

export const Buy: Story = {
  name: '매수고려 (Sage Green)',
  args: {
    verdict: '매수고려',
    size: 'md',
  },
};

export const Hold: Story = {
  name: '관망 (Slate Gray)',
  args: {
    verdict: '관망',
    size: 'md',
  },
};

export const NotRecommended: Story = {
  name: '매수부적합 (Terracotta)',
  args: {
    verdict: '매수부적합',
    size: 'md',
  },
};

export const AllVerdicts: Story = {
  name: '전체 판정 비교',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <VerdictBadge verdict="강력매수" />
      <VerdictBadge verdict="매수고려" />
      <VerdictBadge verdict="관망" />
      <VerdictBadge verdict="매수부적합" />
    </div>
  ),
};

export const SizeComparison: Story = {
  name: '크기 비교',
  render: () => (
    <div className="flex items-center gap-3">
      <VerdictBadge verdict="강력매수" size="sm" />
      <VerdictBadge verdict="강력매수" size="md" />
      <VerdictBadge verdict="강력매수" size="lg" />
    </div>
  ),
};
