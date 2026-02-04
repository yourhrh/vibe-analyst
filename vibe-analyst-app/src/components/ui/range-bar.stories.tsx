import type { Meta, StoryObj } from '@storybook/react';
import { RangeBar } from './range-bar';

const meta = {
  title: 'Design System/RangeBar',
  component: RangeBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithinRange: Story = {
  name: '적정가 범위 내 (Gold)',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 228,
  },
};

export const Overvalued: Story = {
  name: '고평가 (Terracotta)',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 258,
  },
};

export const Undervalued: Story = {
  name: '저평가',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 175,
  },
};

export const WithSafetyMargin: Story = {
  name: '안전마진 포함',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 205,
    safetyMargin: 193,
  },
};

export const NarrowRange: Story = {
  name: '좁은 범위 (확신 높음)',
  args: {
    low: 210,
    base: 215,
    high: 220,
    current: 218,
  },
};

export const WideRange: Story = {
  name: '넓은 범위 (불확실성 높음)',
  args: {
    low: 150,
    base: 215,
    high: 310,
    current: 228,
  },
};
