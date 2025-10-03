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
import type { StudySessionResponse } from "@/lib/api/progress";
import { useAuth } from "@/lib/auth-context";
import { useProgressStats } from "@/lib/hooks/use-progress-stats";

const MINUTES_PER_HOUR = 60;

const sessionColumns: ColumnsType<StudySessionResponse> = [
  {
    dataIndex: "recordedAt",
    key: "recordedAt",
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
    render: (minutes: number) =>
      `${Math.round((minutes / MINUTES_PER_HOUR) * 10) / 10} 小时`,
    title: "学习时长",
  },
];

const ProgressPage = () => {
  const { status: authStatus } = useAuth();
  const { data, status, error } = useProgressStats();

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

  if (error !== null) {
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

  const recentSessions = data?.recentSessions ?? [];
  const weeklyHours = data
    ? Math.round((data.weeklyStudyMinutes / MINUTES_PER_HOUR) * 10) / 10
    : 0;

  return (
    <Space
      direction="vertical"
      size={24}
      style={{ padding: 24, width: "100%" }}
    >
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
              value={weeklyHours}
            />
          </Card>
        </Col>
        <Col md={8} sm={12} xs={24}>
          <Card>
            <Statistic
              suffix="项"
              title="累计完成任务"
              value={data?.totalCompletedTasks ?? 0}
            />
          </Card>
        </Col>
        <Col md={8} sm={12} xs={24}>
          <Card>
            <Statistic
              suffix="天"
              title="连续学习天数"
              value={data?.streakDays ?? 0}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col lg={14} xs={24}>
          <Card title="学习统计">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Statistic
                suffix="天"
                title="活跃学习天数"
                value={data?.activeDays ?? 0}
              />
              <Statistic
                precision={1}
                suffix="分钟"
                title="平均每日学习时长"
                value={data?.avgDailyMinutes ?? 0}
              />
              <Statistic
                suffix="小时"
                title="本月学习时长"
                value={
                  data
                    ? Math.round(
                        (data.monthlyStudyMinutes / MINUTES_PER_HOUR) * 10
                      ) / 10
                    : 0
                }
              />
              <Statistic
                suffix="小时"
                title="总学习时长"
                value={
                  data
                    ? Math.round(
                        (data.totalStudyMinutes / MINUTES_PER_HOUR) * 10
                      ) / 10
                    : 0
                }
              />
            </Space>
          </Card>
        </Col>
        <Col lg={10} xs={24}>
          <Card title="最近学习记录">
            <Table
              aria-label="学习会话记录表"
              columns={sessionColumns}
              dataSource={[...recentSessions]}
              locale={{ emptyText: <Empty description="暂无记录" /> }}
              pagination={{ pageSize: 10 }}
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
