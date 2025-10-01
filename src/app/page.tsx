"use client";

import {
  Card,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";

type LearningPlan = {
  completedSteps: number;
  dueDate: string;
  focus: string;
  id: string;
  sessionId: string;
  targetSteps: number;
  title: string;
};

type StudySession = {
  date: string;
  focus: string;
  id: string;
  minutes: number;
};

const learningPlans: LearningPlan[] = [
  {
    completedSteps: 5,
    dueDate: "2025-10-01",
    focus: "线性代数",
    id: "plan-linear",
    sessionId: "session-linear",
    targetSteps: 7,
    title: "线性代数重点回顾",
  },
  {
    completedSteps: 3,
    dueDate: "2025-10-03",
    focus: "考研英语",
    id: "plan-english",
    sessionId: "session-english",
    targetSteps: 5,
    title: "阅读理解强化练习",
  },
  {
    completedSteps: 2,
    dueDate: "2025-10-05",
    focus: "概率统计",
    id: "plan-statistics",
    sessionId: "session-statistics",
    targetSteps: 6,
    title: "概率论章节复习",
  },
];

const studySessions: StudySession[] = [
  {
    date: "2025-09-28",
    focus: "线性代数习题",
    id: "session-linear",
    minutes: 110,
  },
  {
    date: "2025-09-27",
    focus: "英语阅读理解",
    id: "session-english",
    minutes: 95,
  },
  {
    date: "2025-09-26",
    focus: "概率统计",
    id: "session-statistics",
    minutes: 80,
  },
  {
    date: "2025-09-25",
    focus: "线性代数知识点梳理",
    id: "session-linear-review",
    minutes: 120,
  },
];

const totalWeeklyMinutes = studySessions.reduce(
  (sum, session) => sum + session.minutes,
  0
);
const weeklyHours = Math.round((totalWeeklyMinutes / 60) * 10) / 10;
const totalCompletedSteps = learningPlans.reduce(
  (total, plan) => total + plan.completedSteps,
  0
);

const sessionColumns: ColumnsType<StudySession> = [
  {
    dataIndex: "date",
    key: "date",
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
    render: (value: number) => {
      const hours = Math.round((value / 60) * 10) / 10;
      return `${hours} 小时`;
    },
    title: "学习时长",
  },
];

const LearningPlans = () => (
  <Card
    extra={<Typography.Text>点击计划跳转至对应对话</Typography.Text>}
    title="学习计划"
  >
    <List
      dataSource={learningPlans}
      itemLayout="vertical"
      renderItem={(plan) => {
        const completion =
          plan.targetSteps === 0
            ? 0
            : Math.round((plan.completedSteps / plan.targetSteps) * 100);
        const safeCompletion = completion > 100 ? 100 : completion;
        return (
          <List.Item
            actions={[
              <Link
                href={`/chat?session=${plan.sessionId}`}
                key={`link-${plan.id}`}
              >
                查看对话记录
              </Link>,
            ]}
            key={plan.id}
          >
            <List.Item.Meta
              description={
                <Space size={12} wrap>
                  <Tag bordered={false}>目标：{plan.focus}</Tag>
                  <Tag bordered={false}>截止：{plan.dueDate}</Tag>
                  <Tag bordered={false} color="processing">
                    进度：{plan.completedSteps}/{plan.targetSteps}
                  </Tag>
                </Space>
              }
              title={plan.title}
            />
            <Progress
              aria-label={`${plan.title} 当前完成进度 ${safeCompletion}%`}
              percent={safeCompletion}
              showInfo
            />
          </List.Item>
        );
      }}
    />
  </Card>
);

const StudyOverview = () => (
  <Card title="学习概览">
    <Row gutter={[16, 16]}>
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
        <Statistic suffix="天" title="连续学习天数" value={6} />
      </Col>
    </Row>
  </Card>
);

const StudySessionsTable = () => (
  <Card title="近期学习记录">
    <Table
      aria-label="近期学习记录列表"
      columns={sessionColumns}
      dataSource={studySessions}
      pagination={false}
      rowKey={(record) => record.id}
      size="small"
    />
  </Card>
);

const ProfileCard = () => (
  <Card title="个人信息">
    <Space direction="vertical" size={12}>
      <Typography.Paragraph>姓名：李华</Typography.Paragraph>
      <Typography.Paragraph>
        学习目标：考研英语冲刺 + 数学巩固
      </Typography.Paragraph>
      <Typography.Paragraph>
        最近关注：线性代数核心概念、阅读理解技巧
      </Typography.Paragraph>
    </Space>
  </Card>
);

const Home = () => (
  <Space direction="vertical" size={24} style={{ width: "100%" }}>
    <Typography.Title level={2}>学习主页</Typography.Title>
    <StudyOverview />
    <Row gutter={[24, 24]}>
      <Col lg={14} xs={24}>
        <LearningPlans />
      </Col>
      <Col lg={10} xs={24}>
        <ProfileCard />
        <Divider />
        <StudySessionsTable />
      </Col>
    </Row>
  </Space>
);

export default Home;
