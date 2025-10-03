"use client";

import { Alert, Card, Empty, List, Space, Spin, Tag, Typography } from "antd";
import Link from "next/link";
import { useMemo } from "react";
import type {
  ChatSessionResponse,
  LearningPlanResponse,
} from "@/lib/api/learning";
import { useAuth } from "@/lib/auth-context";
import { useLearningSummary } from "@/lib/hooks/use-learning-summary";

const PersonaProfileCard = ({
  name,
  learningGoal,
  recentFocus,
  focusTags,
}: {
  readonly name: string;
  readonly learningGoal: string;
  readonly recentFocus: string;
  readonly focusTags: readonly string[];
}) => (
  <Card title="学习者画像">
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Typography.Paragraph>姓名：{name}</Typography.Paragraph>
      <Typography.Paragraph>学习目标：{learningGoal}</Typography.Paragraph>
      <Typography.Paragraph>最近关注：{recentFocus}</Typography.Paragraph>
      <Space size={8} wrap>
        {focusTags.map((tag) => (
          <Tag bordered={false} color="processing" key={tag}>
            {tag}
          </Tag>
        ))}
      </Space>
    </Space>
  </Card>
);

const SessionInsights = ({
  sessions,
}: {
  readonly sessions: readonly ChatSessionResponse[];
}) => (
  <Card title="对话偏好">
    <List
      dataSource={sessions}
      locale={{ emptyText: <Empty description="暂无对话记录" /> }}
      renderItem={(session) => (
        <List.Item key={session.id}>
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Space align="center" size={8} wrap>
              <Typography.Text strong>{session.title}</Typography.Text>
              <Tag bordered={false}>{session.focus}</Tag>
            </Space>
            <Typography.Text type="secondary">
              最近活跃：{new Date(session.updatedAt).toLocaleString()}
            </Typography.Text>
            <Link href={{ pathname: "/chat", query: { session: session.id } }}>
              查看该会话详情
            </Link>
          </Space>
        </List.Item>
      )}
    />
  </Card>
);

const LearningStrategyCard = ({
  plans,
}: {
  readonly plans: readonly LearningPlanResponse[];
}) => (
  <Card title="学习策略建议">
    <List
      dataSource={plans}
      locale={{ emptyText: "暂无学习计划" }}
      renderItem={(plan) => (
        <List.Item key={plan.id}>
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Typography.Text strong>{plan.title}</Typography.Text>
            <Typography.Text type="secondary">
              当前完成 {plan.completedSteps}/{plan.targetSteps}
              {plan.dueDate
                ? ` · 截止 ${new Date(plan.dueDate).toLocaleDateString()}`
                : ""}
            </Typography.Text>
            <Typography.Text>
              建议：优先完成状态为“进行中”的任务，并在完成后回顾错题以强化记忆。
            </Typography.Text>
          </Space>
        </List.Item>
      )}
    />
  </Card>
);

const PersonaPage = () => {
  const { status: authStatus } = useAuth();
  const { data, status, error } = useLearningSummary();

  const plans = data?.learningPlans ?? [];
  const focusTags = useMemo(() => {
    const tags = new Set<string>();
    for (const plan of plans) {
      tags.add(plan.focus);
    }
    return Array.from(tags);
  }, [plans]);

  if (authStatus !== "authenticated") {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{ padding: 24, width: "100%" }}
      >
        <Alert
          action={<Link href="/login">前往登录</Link>}
          message="请登录以查看画像信息"
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

  if (!data) {
    return null;
  }

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={2}>学习者画像</Typography.Title>
      <Typography.Paragraph type="secondary">
        汇总学习者的目标、关注重点与会话偏好，为个性化推荐提供依据。
      </Typography.Paragraph>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <PersonaProfileCard
          focusTags={focusTags}
          learningGoal={data.learnerProfile.learningGoal}
          name={data.learnerProfile.name}
          recentFocus={data.learnerProfile.recentFocus}
        />
        <SessionInsights sessions={data.chatSessions} />
        <LearningStrategyCard plans={plans} />
      </Space>
    </Space>
  );
};

export default PersonaPage;
