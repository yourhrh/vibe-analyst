import type { Meta, StoryObj } from '@storybook/react';
import { ScoreBar } from './score-bar';

const meta = {
  title: 'Design System/ScoreBar',
  component: ScoreBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScoreBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '경제적 해자',
    score: 4,
    maxScore: 5,
  },
};

export const HighScore: Story = {
  args: {
    label: '수익성',
    score: 5,
    maxScore: 5,
  },
};

export const LowScore: Story = {
  args: {
    label: '부채 건전성',
    score: 2,
    maxScore: 5,
  },
};

export const SmallSize: Story = {
  args: {
    label: '성장성',
    score: 3,
    maxScore: 5,
    size: 'sm',
  },
};

export const BuffettCriteria: Story = {
  name: '버핏 분석 기준 (전체)',
  render: () => (
    <div className="flex flex-col gap-3">
      <ScoreBar label="경제적 해자" score={4} />
      <ScoreBar label="경영진 역량" score={5} />
      <ScoreBar label="재무 건전성" score={4} />
      <ScoreBar label="수익 안정성" score={3} />
      <ScoreBar label="적정 가격" score={2} />
    </div>
  ),
};

export const CustomMax: Story = {
  args: {
    label: '종합 점수',
    score: 78,
    maxScore: 100,
  },
};
