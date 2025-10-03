"use client";

import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import type {
  LearningPlanResponse,
  StudySessionResponse,
} from "@/lib/api/learning";
import { useAuth } from "@/lib/auth-context";
import { useLearningSummary } from "@/lib/hooks/use-learning-summary";

const PERCENTAGE_MULTIPLIER = 100;

const sessionColumns: ColumnsType<StudySessionResponse> = [
  {
    dataIndex: "date",
    key: "date",
    render: (value: string) => new Date(value).toLocaleDateString(),
    title: "日期",
  },
  {
    dataIndex: "focus",
    key: "focus",
    title: "学习主题",
  },
  {
    dataIndex: "minutes",
    key: "minutes",
    render: (minutes: number) => `${Math.round((minutes / 60) * 10) / 10} 小时`,
    title: "学习时长",
  },
];

const PlanProgressList = ({
  plans,
}: {
  readonly plans: readonly LearningPlanResponse[];
}) => (
  <Space direction="vertical" size={16} style={{ width: "100%" }}>
    {plans.map((plan) => {
      const completion =
        plan.targetSteps === 0
          ? 0
          : Math.round(
              (plan.completedSteps / plan.targetSteps) * PERCENTAGE_MULTIPLIER
            );
      return (
        <Card key={plan.id} title={plan.title}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text type="secondary">
              {plan.focus} ·
              {plan.dueDate
                ? `截止 ${new Date(plan.dueDate).toLocaleDateString()}`
                : "无截止日期"}
            </Typography.Text>
            <Typography.Text>
              已完成 {plan.completedSteps}/{plan.targetSteps}
            </Typography.Text>
            <Typography.Text>完成度：{completion}%</Typography.Text>
          </Space>
        </Card>
      );
    })}
  </Space>
);

const ProgressPage = () => {
  const { status: authStatus } = useAuth();
  const { data, status, error } = useLearningSummary();

  if (authStatus !== "authenticated") {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{ padding: 24, width: "100%" }}
      >
        <Alert
          action={<Link href="/login">前往登录</Link>}
          message="请登录以查看学习进度"
          showIcon
          type="info"
        />
      </Space>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{ padding: 24, width: "100%" }}
      >
        <Spin size="large" />
      </Space>
    );
  }

  if (error) {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{ padding: 24, width: "100%" }}
      >
        <Alert message={error} showIcon type="error" />
      </Space>
    );
  }

  const plans = data?.learningPlans ?? [];
  const studySessions = data?.studySessions ?? [];
  const metrics = data?.metrics ?? {
    streakDays: 0,
    totalCompletedSteps: 0,
    weeklyHours: 0,
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={2}>学习进度</Typography.Title>
      <Typography.Paragraph type="secondary">
        了解近期学习投入、计划完成情况与任务完成总览。
      </Typography.Paragraph>
      <Row gutter={[24, 24]}>
        <Col md={8} sm={12} xs={24}>
          <Card>
            <Statistic
              suffix="小时"
              title="近一周学习时长"
              value={metrics.weeklyHours}
            />
          </Card>
        </Col>
        <Col md={8} sm={12} xs={24}>
          <Card>
            <Statistic
              suffix="项"
              title="累计完成任务"
              value={metrics.totalCompletedSteps}
            />
          </Card>
        </Col>
        <Col md={8} sm={12} xs={24}>
          <Card>
            <Statistic
              suffix="天"
              title="连续学习天数"
              value={metrics.streakDays}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col lg={14} xs={24}>
          <Card title="计划完成度">
            {plans.length === 0 ? (
              <Empty description="暂无学习计划" />
            ) : (
              <PlanProgressList plans={plans} />
            )}
          </Card>
        </Col>
        <Col lg={10} xs={24}>
          <Card title="学习会话记录">
            <Table
              aria-label="学习会话记录表"
              columns={sessionColumns}
              dataSource={studySessions}
              locale={{ emptyText: <Empty description="暂无记录" /> }}
              pagination={false}
              rowKey={(session) => session.id}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default ProgressPage;
