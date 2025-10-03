"use client";

import {
  Alert,
  Card,
  Empty,
  List,
  Progress,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import type {
  LearningPlanResponse,
  LearningTaskResponse,
} from "@/lib/api/learning";
import { useAuth } from "@/lib/auth-context";
import { useLearningSummary } from "@/lib/hooks/use-learning-summary";

const PERCENTAGE_MULTIPLIER = 100;

const renderTaskMeta = (task: LearningTaskResponse) => {
  let statusText = "待开始";
  let color: "default" | "processing" | "success" = "default";
  if (task.status === "done") {
    statusText = "已完成";
    color = "success";
  } else if (task.status === "in-progress") {
    statusText = "进行中";
    color = "processing";
  }
  return (
    <Space size={8} wrap>
      <Tag color={color}>状态：{statusText}</Tag>
      {task.dueDate ? (
        <Tag bordered={false}>
          截止：{new Date(task.dueDate).toLocaleDateString()}
        </Tag>
      ) : null}
    </Space>
  );
};

const PlanCard = ({ plan }: { readonly plan: LearningPlanResponse }) => {
  const completion =
    plan.targetSteps === 0
      ? 0
      : Math.round(
          (plan.completedSteps / plan.targetSteps) * PERCENTAGE_MULTIPLIER
        );
  return (
    <Card
      actions={[
        plan.sessionId ? (
          <Link
            href={{ pathname: "/chat", query: { session: plan.sessionId } }}
            key={`${plan.id}-link`}
          >
            查看对应对话
          </Link>
        ) : null,
      ]}
      title={plan.title}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space size={12} wrap>
          <Tag bordered={false}>目标：{plan.focus}</Tag>
          {plan.dueDate ? (
            <Tag bordered={false}>
              截止：{new Date(plan.dueDate).toLocaleDateString()}
            </Tag>
          ) : null}
          <Tag bordered={false} color="processing">
            进度：{plan.completedSteps}/{plan.targetSteps}
          </Tag>
        </Space>
        <Progress
          aria-label={`${plan.title} 当前完成进度 ${completion}%`}
          percent={completion}
          showInfo
        />
        <List
          dataSource={plan.tasks}
          locale={{ emptyText: "暂无任务" }}
          renderItem={(task) => (
            <List.Item key={task.id}>
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Typography.Text>{task.summary}</Typography.Text>
                {renderTaskMeta(task)}
              </Space>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
};

const PlanPage = () => {
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
          message="请登录以查看学习计划"
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

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={2}>学习计划总览</Typography.Title>
      <Typography.Paragraph type="secondary">
        查看所有学习计划的进度、任务拆解和关联的对话会话。
      </Typography.Paragraph>
      {plans.length === 0 ? (
        <Empty description="暂无学习计划" />
      ) : (
        <List
          dataSource={plans}
          grid={{ column: 2, gutter: 24 }}
          renderItem={(plan) => (
            <List.Item key={plan.id}>
              <PlanCard plan={plan} />
            </List.Item>
          )}
        />
      )}
    </Space>
  );
};

export default PlanPage;
