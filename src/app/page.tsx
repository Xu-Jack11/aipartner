"use client";

import {
  Alert,
  Card,
  Col,
  Divider,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useMemo } from "react";
import type {
  ChatSessionResponse,
  LearningPlanResponse,
  StudySessionResponse,
} from "@/lib/api/learning";
import { useAuth } from "@/lib/auth-context";
import { useLearningSummary } from "@/lib/hooks/use-learning-summary";

const PERCENTAGE_MULTIPLIER = 100;
const GRID_GUTTER_COMPACT = 16;
const STUDY_OVERVIEW_GUTTER: [number, number] = [
  GRID_GUTTER_COMPACT,
  GRID_GUTTER_COMPACT,
];
const MAX_RECENT_CHAT_SESSIONS = 3;

const StudySessionsColumns: ColumnsType<StudySessionResponse> = [
  {
    dataIndex: "date",
    key: "date",
    render: (value: string) => new Date(value).toLocaleDateString(),
    title: "日期",
  },
  {
    dataIndex: "focus",
    key: "focus",
    title: "主题",
  },
  {
    dataIndex: "minutes",
    key: "minutes",
    render: (value: number) => `${Math.round((value / 60) * 10) / 10} 小时`,
    title: "学习时长",
  },
];

const LearningPlans = ({
  plans,
}: {
  readonly plans: readonly LearningPlanResponse[];
}) => (
  <Card
    extra={<Typography.Text>点击计划跳转至对应对话</Typography.Text>}
    title="学习计划"
  >
    <List
      dataSource={plans ? [...plans] : []}
      itemLayout="vertical"
      locale={{ emptyText: <Empty description="暂无学习计划" /> }}
      renderItem={(plan) => {
        const completion =
          plan.targetSteps === 0
            ? 0
            : Math.round(
                (plan.completedSteps / plan.targetSteps) * PERCENTAGE_MULTIPLIER
              );
        return (
          <List.Item
            actions={[
              plan.sessionId ? (
                <Link
                  href={{
                    pathname: "/chat",
                    query: { session: plan.sessionId },
                  }}
                  key={`${plan.id}-link`}
                >
                  查看对话记录
                </Link>
              ) : null,
            ]}
            key={plan.id}
          >
            <List.Item.Meta
              description={
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
              }
              title={plan.title}
            />
            <Progress
              aria-label={`${plan.title} 当前完成进度 ${completion}%`}
              percent={completion}
              showInfo
            />
          </List.Item>
        );
      }}
    />
  </Card>
);

const StudyOverview = ({
  weeklyHours,
  totalCompletedSteps,
  streakDays,
}: {
  readonly weeklyHours: number;
  readonly totalCompletedSteps: number;
  readonly streakDays: number;
}) => (
  <Card title="学习概览">
    <Row gutter={STUDY_OVERVIEW_GUTTER}>
      <Col md={8} sm={12} xs={24}>
        <Statistic suffix="小时" title="本周学习时长" value={weeklyHours} />
      </Col>
      <Col md={8} sm={12} xs={24}>
        <Statistic
          suffix="项"
          title="累计完成任务"
          value={totalCompletedSteps}
        />
      </Col>
      <Col md={8} sm={12} xs={24}>
        <Statistic suffix="天" title="连续学习天数" value={streakDays} />
      </Col>
    </Row>
  </Card>
);

const StudySessionsTable = ({
  sessions,
}: {
  readonly sessions: readonly StudySessionResponse[];
}) => (
  <Card title="近期学习记录">
    <Table
      aria-label="近期学习记录列表"
      columns={StudySessionsColumns}
      dataSource={sessions}
      locale={{ emptyText: <Empty description="暂无学习记录" /> }}
      pagination={false}
      rowKey={(record) => record.id}
      size="small"
    />
  </Card>
);

const ProfileCard = ({
  name,
  learningGoal,
  recentFocus,
}: {
  readonly name: string;
  readonly learningGoal: string;
  readonly recentFocus: string;
}) => (
  <Card title="个人信息">
    <Space direction="vertical" size={12}>
      <Typography.Paragraph>姓名：{name}</Typography.Paragraph>
      <Typography.Paragraph>学习目标：{learningGoal}</Typography.Paragraph>
      <Typography.Paragraph>最近关注：{recentFocus}</Typography.Paragraph>
    </Space>
  </Card>
);

const Home = () => {
  const { status: authStatus } = useAuth();
  const { data, status, error } = useLearningSummary();

  const isLoading =
    status === "loading" ||
    (authStatus === "authenticated" && status === "idle");
  const showLoginReminder = authStatus !== "authenticated";

  const chatSessions = useMemo<ChatSessionResponse[]>(() => {
    if (!data) {
      return [];
    }
    const sessions: ChatSessionResponse[] = [];
    for (const session of data.chatSessions) {
      sessions.push(session);
      if (sessions.length === MAX_RECENT_CHAT_SESSIONS) {
        break;
      }
    }
    return sessions;
  }, [data]);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={2}>学习主页</Typography.Title>
      {showLoginReminder ? (
        <Alert
          action={<Link href="/login">前往登录</Link>}
          message="请登录以查看个性化学习数据"
          showIcon
          type="info"
        />
      ) : null}
      {error ? <Alert message={error} showIcon type="error" /> : null}
      {isLoading ? (
        <Space align="center" style={{ width: "100%", padding: "48px 0" }}>
          <Spin size="large" />
        </Space>
      ) : null}
      {data && !isLoading ? (
        <>
          <StudyOverview
            streakDays={data.metrics.streakDays}
            totalCompletedSteps={data.metrics.totalCompletedSteps}
            weeklyHours={data.metrics.weeklyHours}
          />
          <Row gutter={[24, 24]}>
            <Col lg={14} xs={24}>
              <LearningPlans plans={data.learningPlans} />
            </Col>
            <Col lg={10} xs={24}>
              <ProfileCard
                learningGoal={data.learnerProfile.learningGoal}
                name={data.learnerProfile.name}
                recentFocus={data.learnerProfile.recentFocus}
              />
              <Divider />
              <StudySessionsTable sessions={data.studySessions} />
            </Col>
          </Row>
          {chatSessions.length > 0 ? (
            <Card title="最近对话">
              <List
                dataSource={chatSessions}
                renderItem={(session) => (
                  <List.Item key={session.id}>
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <Typography.Text strong>{session.title}</Typography.Text>
                      <Typography.Text type="secondary">
                        {`${session.updatedAt ? new Date(session.updatedAt).toLocaleString() : ""} · ${session.focus}`}
                      </Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          ) : null}
        </>
      ) : null}
    </Space>
  );
};

export default Home;
