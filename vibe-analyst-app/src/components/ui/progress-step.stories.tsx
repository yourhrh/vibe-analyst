import type { Meta, StoryObj } from '@storybook/react';
import { ProgressStep } from './progress-step';

const meta = {
  title: 'Design System/ProgressStep',
  component: ProgressStep,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'in_progress', 'completed', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {
  args: {
    label: '재무제표 수집 완료',
    status: 'completed',
    description: '매출 $394B, 영업이익률 30.7%',
  },
};

export const InProgress: Story = {
  args: {
    label: '리포트 작성 중',
    status: 'in_progress',
  },
};

export const Pending: Story = {
  args: {
    label: '투자자 분석',
    status: 'pending',
  },
};

export const Error: Story = {
  args: {
    label: '데이터 수집 실패',
    status: 'error',
  },
};

export const AnalysisPipeline: Story = {
  name: '분석 파이프라인 (IDEO Screen 3)',
  render: () => (
    <div className="flex flex-col gap-2">
      <ProgressStep
        label="재무제표 수집 완료"
        status="completed"
        description="매출 $394B, 영업이익률 30.7%"
      />
      <ProgressStep
        label="뉴스 및 시장 데이터 수집 완료"
        status="completed"
        description="최근 30일 뉴스 12건"
      />
      <ProgressStep
        label="종합 리포트 작성 중"
        status="in_progress"
      />
      <ProgressStep
        label="투자자 관점 분석"
        status="pending"
      />
      <ProgressStep
        label="밸류에이션 계산"
        status="pending"
      />
    </div>
  ),
};

export const AllCompleted: Story = {
  name: '전체 완료',
  render: () => (
    <div className="flex flex-col gap-2">
      <ProgressStep
        label="재무제표 수집 완료"
        status="completed"
        description="매출 $394B, 영업이익률 30.7%"
      />
      <ProgressStep
        label="뉴스 수집 완료"
        status="completed"
        description="최근 30일 뉴스 12건"
      />
      <ProgressStep
        label="종합 리포트 작성 완료"
        status="completed"
      />
      <ProgressStep
        label="투자자 분석 완료"
        status="completed"
        description="6명 투자자 의견 수렴"
      />
      <ProgressStep
        label="밸류에이션 계산 완료"
        status="completed"
        description="DCF $215, RIM $208"
      />
    </div>
  ),
};

export const WithError: Story = {
  name: '에러 상태 포함',
  render: () => (
    <div className="flex flex-col gap-2">
      <ProgressStep
        label="재무제표 수집 완료"
        status="completed"
        description="매출 $394B, 영업이익률 30.7%"
      />
      <ProgressStep
        label="뉴스 수집 실패"
        status="error"
      />
      <ProgressStep
        label="종합 리포트 작성"
        status="pending"
      />
    </div>
  ),
};
