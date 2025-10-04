"use client";

import {
  Alert,
  Card,
  Col,
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
import type { StudySessionResponse } from "@/lib/api/progress";
import { useAuth } from "@/lib/auth-context";
import { useProgressStats } from "@/lib/hooks/use-progress-stats";
import { useProgressTrend } from "@/lib/hooks/use-progress-trend";

const MINUTES_PER_HOUR = 60;
const TREND_QUERY_DAYS = 30;
const RECENT_TREND_WINDOW = 7;
const PERCENTAGE_BASE = 100;

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
  const {
    data: trend,
    status: trendStatus,
    error: trendError,
  } = useProgressTrend(TREND_QUERY_DAYS);

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

  const renderTrendContent = () => {
    if (trendStatus === "loading" || trendStatus === "idle") {
      return (
        <Space align="center" style={{ width: "100%" }}>
          <Spin size="small" />
          <Typography.Text type="secondary">正在载入趋势数据…</Typography.Text>
        </Space>
      );
    }

    if (trendError) {
      return <Alert message={trendError} showIcon type="error" />;
    }

    const trendPoints = trend?.dataPoints ?? [];

    if (trendPoints.length === 0) {
      return (
        <Empty
          description="暂无趋势数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    const displayedPoints = [...trendPoints]
      .slice(-RECENT_TREND_WINDOW)
      .reverse();
    const totalMinutes = displayedPoints.reduce(
      (sum, point) => sum + point.minutes,
      0
    );
    const totalHours = Math.round((totalMinutes / MINUTES_PER_HOUR) * 10) / 10;
    const maxMinutes = Math.max(
      ...displayedPoints.map((point) => point.minutes),
      0
    );
    const safeMaxMinutes = maxMinutes === 0 ? 1 : maxMinutes;

    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Text type="secondary">
          最近{displayedPoints.length}天共学习 {totalHours} 小时
        </Typography.Text>
        <List
          dataSource={displayedPoints}
          locale={{ emptyText: "暂无趋势数据" }}
          renderItem={(point) => {
            const percentage = Math.round(
              (point.minutes / safeMaxMinutes) * PERCENTAGE_BASE
            );
            const studyHours =
              Math.round((point.minutes / MINUTES_PER_HOUR) * 10) / 10;
            return (
              <List.Item key={point.date}>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <div
                    style={{
                      alignItems: "baseline",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Typography.Text strong>
                      {new Date(point.date).toLocaleDateString()}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      完成任务 {point.completedTasks} 项
                    </Typography.Text>
                  </div>
                  <Progress
                    aria-label={`学习${studyHours}小时`}
                    percent={percentage}
                    showInfo={false}
                    strokeLinecap="round"
                  />
                  <Space size={8} wrap>
                    <Tag color="blue">学习 {studyHours} 小时</Tag>
                    {point.completedTasks > 0 ? (
                      <Tag color="success">
                        完成任务 {point.completedTasks} 项
                      </Tag>
                    ) : (
                      <Tag>暂无任务完成</Tag>
                    )}
                  </Space>
                </Space>
              </List.Item>
            );
          }}
        />
      </Space>
    );
  };

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
          <Card title="学习趋势">{renderTrendContent()}</Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col span={24}>
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
