"use client";

import { BookOutlined, BulbOutlined, GlobalOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Input,
  List,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { Suspense, useMemo, useState } from "react";
import type {
  ChatSessionResponse,
  LearningPlanResponse,
} from "@/lib/api/learning";
import { useAuth } from "@/lib/auth-context";
import { useLearningSummary } from "@/lib/hooks/use-learning-summary";

const PERCENTAGE_MULTIPLIER = 100;

const conversationActions = [
  {
    description: "向 AI 请求更深入的分析与推理",
    icon: <BulbOutlined />,
    key: "deep-analyze",
    label: "深度思考",
  },
  {
    description: "联网上搜集最新资料",
    icon: <GlobalOutlined />,
    key: "web-search",
    label: "联网搜索",
  },
  {
    description: "检索个人知识库获得上下文",
    icon: <BookOutlined />,
    key: "knowledge-base",
    label: "知识库",
  },
];

const modelOptions = [
  {
    label: "GPT-4o",
    value: "gpt-4o",
  },
  {
    label: "Claude 3.5",
    value: "claude-3.5",
  },
];

const messageContainerStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minHeight: 240,
  justifyContent: "center",
};

const calculateTaskCompletion = (
  plan: LearningPlanResponse | undefined
): number => {
  if (!plan || plan.targetSteps === 0) {
    return 0;
  }
  return Math.round(
    (plan.completedSteps / plan.targetSteps) * PERCENTAGE_MULTIPLIER
  );
};

const ChatSidebar = ({
  sessions,
  activeSessionId,
}: {
  readonly sessions: readonly ChatSessionResponse[];
  readonly activeSessionId: string;
}) => (
  <section aria-label="历史对话" className="chat-section chat-section--left">
    <Card title="历史对话" variant="borderless">
      <List
        dataSource={sessions}
        locale={{ emptyText: "暂无对话" }}
        renderItem={(session) => {
          const isActive = session.id === activeSessionId;
          return (
            <List.Item
              key={session.id}
              style={{
                background: isActive
                  ? "rgba(22, 119, 255, 0.16)"
                  : "transparent",
                borderRadius: 8,
                transition: "background-color 0.2s ease",
              }}
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  href={{ pathname: "/chat", query: { session: session.id } }}
                >
                  <Typography.Text strong>{session.title}</Typography.Text>
                </Link>
                <Typography.Text type="secondary">
                  {new Date(session.updatedAt).toLocaleString()} ·{" "}
                  {session.focus}
                </Typography.Text>
              </Space>
            </List.Item>
          );
        }}
      />
    </Card>
  </section>
);

const ChatTaskList = ({ plan }: { readonly plan?: LearningPlanResponse }) => {
  const completionPercent = calculateTaskCompletion(plan);
  return (
    <section
      aria-label="学习计划待办"
      className="chat-section chat-section--right"
    >
      <Card title="学习计划待办" variant="borderless">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Progress
            aria-label={`当前学习计划完成度 ${completionPercent}%`}
            percent={completionPercent}
            showInfo
          />
          <List
            dataSource={plan?.tasks ?? []}
            locale={{ emptyText: "暂无任务" }}
            renderItem={(task) => {
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
                <List.Item key={task.id}>
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Typography.Text>{task.summary}</Typography.Text>
                    <Space size={8} wrap>
                      <Tag color={color}>状态：{statusText}</Tag>
                      {task.dueDate ? (
                        <Tag bordered={false}>
                          截止：{new Date(task.dueDate).toLocaleDateString()}
                        </Tag>
                      ) : null}
                    </Space>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Space>
      </Card>
    </section>
  );
};

const ChatComposer = ({
  model,
  onModelChange,
}: {
  readonly model: string;
  readonly onModelChange: (value: string) => void;
}) => (
  <Card>
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space align="center" size={12} wrap>
        <Select
          aria-label="选择对话模型"
          onChange={onModelChange}
          options={modelOptions}
          style={{ minWidth: 180 }}
          value={model}
        />
        {conversationActions.map((action) => (
          <Button
            aria-label={`${action.label}:${action.description}`}
            htmlType="button"
            icon={action.icon}
            key={action.key}
            type="default"
          >
            {action.label}
          </Button>
        ))}
      </Space>
      <Input.TextArea placeholder="请输入你的问题或学习内容..." rows={4} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button htmlType="button" type="primary">
          发送
        </Button>
      </div>
    </Space>
  </Card>
);

const ChatContent = () => {
  const { status: authStatus } = useAuth();
  const { data, status, error } = useLearningSummary();
  const searchParams = useSearchParams();
  const [model, setModel] = useState(modelOptions[0].value);

  const sessions = data?.chatSessions ?? [];
  const fallbackSession = sessions.length > 0 ? sessions[0] : undefined;
  const activeSessionId =
    searchParams.get("session") ?? fallbackSession?.id ?? "";
  const activeSession = useMemo(() => {
    for (const session of sessions) {
      if (session.id === activeSessionId) {
        return session;
      }
    }
    return fallbackSession;
  }, [activeSessionId, fallbackSession, sessions]);

  const activePlan = useMemo(() => {
    if (!(activeSession && data)) {
      return;
    }
    for (const plan of data.learningPlans) {
      if (plan.sessionId === activeSession.id) {
        return plan;
      }
    }
    return;
  }, [activeSession, data]);

  if (authStatus !== "authenticated") {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{ padding: 24, width: "100%" }}
      >
        <Alert
          action={<Link href="/login">前往登录</Link>}
          message="请登录后访问对话记录"
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

  if (!activeSession) {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{ padding: 24, width: "100%" }}
      >
        <Alert message="暂无对话记录" showIcon type="info" />
      </Space>
    );
  }

  return (
    <div className="chat-layout">
      <ChatSidebar activeSessionId={activeSession.id} sessions={sessions} />
      <section
        aria-label="对话内容"
        className="chat-section chat-section--center"
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Typography.Title level={3}>{activeSession.title}</Typography.Title>
          <Card>
            <div style={messageContainerStyle}>
              <Typography.Text type="secondary">
                聊天内容即将上线，敬请期待。
              </Typography.Text>
            </div>
          </Card>
          <ChatComposer model={model} onModelChange={setModel} />
        </Space>
      </section>
      <ChatTaskList plan={activePlan} />
    </div>
  );
};

const ChatPage = () => (
  <Suspense
    fallback={
      <Space
        align="center"
        direction="vertical"
        style={{ padding: 24, width: "100%" }}
      >
        <Spin size="large" />
      </Space>
    }
  >
    <ChatContent />
  </Suspense>
);

export default ChatPage;
