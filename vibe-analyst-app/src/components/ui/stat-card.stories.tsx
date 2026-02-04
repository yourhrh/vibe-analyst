import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './stat-card';

const meta = {
  title: 'Design System/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['currency', 'percent', 'ratio', 'plain'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Revenue: Story = {
  name: '매출',
  args: {
    label: '매출',
    value: 394_000_000_000,
    format: 'currency',
    change: 8.2,
  },
};

export const OperatingMargin: Story = {
  name: '영업이익률',
  args: {
    label: '영업이익률',
    value: 30.7,
    format: 'percent',
    change: 2.4,
  },
};

export const PERatio: Story = {
  name: 'PER',
  args: {
    label: 'PER',
    value: 28.5,
    format: 'ratio',
    subtitle: '업종 평균 32.1x',
  },
};

export const NegativeChange: Story = {
  name: '하락 수치',
  args: {
    label: '순이익',
    value: 94_000_000_000,
    format: 'currency',
    change: -3.1,
  },
};

export const FinancialHighlights: Story = {
  name: '재무 하이라이트 그리드 (IDEO Screen 4)',
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="매출" value={394_000_000_000} format="currency" change={8.2} />
      <StatCard label="영업이익률" value={30.7} format="percent" change={2.4} />
      <StatCard label="순이익" value={94_000_000_000} format="currency" change={-3.1} />
      <StatCard label="PER" value={28.5} format="ratio" subtitle="업종 평균 32.1x" />
      <StatCard label="ROE" value={175.5} format="percent" change={12.3} />
      <StatCard label="부채비율" value={176.3} format="percent" change={-5.2} />
    </div>
  ),
};
