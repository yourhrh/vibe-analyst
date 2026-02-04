import type { Meta, StoryObj } from '@storybook/react';
import { FinancialNumber } from './financial-number';

const meta = {
  title: 'Design System/FinancialNumber',
  component: FinancialNumber,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['currency', 'percent', 'ratio', 'plain'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof FinancialNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- 기본 ---

export const Currency: Story = {
  args: {
    value: 394_000_000_000,
    format: 'currency',
    size: 'lg',
  },
};

export const CurrencyWithPositiveChange: Story = {
  args: {
    value: 394_000_000_000,
    format: 'currency',
    change: 8.2,
    size: 'lg',
  },
};

export const CurrencyWithNegativeChange: Story = {
  args: {
    value: 394_000_000_000,
    format: 'currency',
    change: -3.1,
    size: 'lg',
  },
};

export const Percent: Story = {
  args: {
    value: 30.7,
    format: 'percent',
    change: 2.4,
  },
};

export const Ratio: Story = {
  args: {
    value: 28.5,
    format: 'ratio',
  },
};

export const Plain: Story = {
  args: {
    value: 1_500_000,
    format: 'plain',
    change: -1.2,
  },
};

// --- 크기 비교 ---

export const SizeComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-4">
        <span className="w-12 text-xs text-[#8b8fa3]">sm</span>
        <FinancialNumber value={394_000_000_000} format="currency" change={8.2} size="sm" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-12 text-xs text-[#8b8fa3]">md</span>
        <FinancialNumber value={394_000_000_000} format="currency" change={8.2} size="md" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-12 text-xs text-[#8b8fa3]">lg</span>
        <FinancialNumber value={394_000_000_000} format="currency" change={8.2} size="lg" />
      </div>
    </div>
  ),
};

// --- 단위 축약 ---

export const Abbreviations: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Trillions</span>
        <FinancialNumber value={2_500_000_000_000} format="currency" size="lg" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Billions</span>
        <FinancialNumber value={394_000_000_000} format="currency" size="lg" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Millions</span>
        <FinancialNumber value={12_500_000} format="currency" size="lg" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Thousands</span>
        <FinancialNumber value={8_500} format="currency" size="lg" />
      </div>
    </div>
  ),
};
