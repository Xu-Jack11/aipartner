"use client";

import { BookOutlined, BulbOutlined, GlobalOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  List,
  Progress,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { Suspense, useMemo, useState } from "react";

type ChatSession = {
  focus: string;
  id: string;
  title: string;
  updatedAt: string;
};

type ChatMessage = {
  content: string;
  id: string;
  role: "assistant" | "user";
  timestamp: string;
};

type PlanTask = {
  dueDate: string;
  id: string;
  status: "todo" | "in-progress" | "done";
  summary: string;
};

const chatSessions: ChatSession[] = [
  {
    focus: "线性代数",
    id: "session-linear",
    title: "线性代数重点回顾",
    updatedAt: "09-28 21:10",
  },
  {
    focus: "考研英语",
    id: "session-english",
    title: "阅读理解强化练习",
    updatedAt: "09-27 19:42",
  },
  {
    focus: "概率统计",
    id: "session-statistics",
    title: "概率论章节复习",
    updatedAt: "09-26 20:05",
  },
];

const messagesBySession: Record<string, ChatMessage[]> = {
  "session-linear": [
    {
      content: "我想梳理矩阵运算与特征值的重点，有没有学习建议？",
      id: "msg-1",
      role: "user",
      timestamp: "09-28 20:55",
    },
    {
      content:
        "先复习矩阵基本运算，再结合例题理解特征值与特征向量的物理意义。建议按概念 → 例题 → 小测验的顺序推进。",
      id: "msg-2",
      role: "assistant",
      timestamp: "09-28 20:56",
    },
    {
      content: "可以安排一个检测题吗？",
      id: "msg-3",
      role: "user",
      timestamp: "09-28 20:58",
    },
    {
      content:
        "好的，我准备了三道练习题，并在右侧待办清单中列出。完成后告诉我你的得分，我们再调整复习策略。",
      id: "msg-4",
      role: "assistant",
      timestamp: "09-28 20:59",
    },
  ],
  "session-english": [
    {
      content: "长难句还是读不顺，能帮我拆解吗？",
      id: "msg-5",
      role: "user",
      timestamp: "09-27 19:12",
    },
    {
      content:
        "先识别从句界限，再抓谓语动词。推荐你每天完成两篇阅读并标注句法结构，具体练习请查看待办中的“句法标注”任务。",
      id: "msg-6",
      role: "assistant",
      timestamp: "09-27 19:15",
    },
  ],
  "session-statistics": [
    {
      content: "抽样分布这块有没有图形化的理解方式？",
      id: "msg-7",
      role: "user",
      timestamp: "09-26 19:30",
    },
    {
      content:
        "建议先用正态分布的抽样示意图理解，再做卡方分布的对比练习。我已在待办中安排“绘制抽样流程图”。",
      id: "msg-8",
      role: "assistant",
      timestamp: "09-26 19:32",
    },
  ],
};

const planTasksBySession: Record<string, PlanTask[]> = {
  "session-linear": [
    {
      dueDate: "09-29",
      id: "task-1",
      status: "in-progress",
      summary: "整理矩阵运算公式并完成 2 道例题",
    },
    {
      dueDate: "09-29",
      id: "task-2",
      status: "todo",
      summary: "完成特征值自测题并记录错题",
    },
    {
      dueDate: "09-30",
      id: "task-3",
      status: "todo",
      summary: "总结特征向量在实际问题中的应用",
    },
  ],
  "session-english": [
    {
      dueDate: "09-28",
      id: "task-4",
      status: "done",
      summary: "阅读理解练习题 2 篇并整理生词表",
    },
    {
      dueDate: "09-29",
      id: "task-5",
      status: "in-progress",
      summary: "句法标注训练（每日 2 段）",
    },
  ],
  "session-statistics": [
    {
      dueDate: "09-28",
      id: "task-6",
      status: "in-progress",
      summary: "绘制正态抽样流程图",
    },
    {
      dueDate: "09-29",
      id: "task-7",
      status: "todo",
      summary: "完成卡方分布练习题 3 道",
    },
  ],
};

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
] as const;

const modelOptions = [
  {
    label: "GPT-4o",
    value: "gpt-4o",
  },
  {
    label: "Claude 3.5",
    value: "claude-3.5",
  },
] as const;

const messageContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

type ChatMessageItemProps = {
  message: ChatMessage;
};

const ChatMessageItem = ({ message }: ChatMessageItemProps) => {
  const isUser = message.role === "user";
  const alignmentStyle: CSSProperties = {
    alignItems: isUser ? "flex-end" : "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };
  const bubbleStyle: CSSProperties = {
    alignSelf: isUser ? "flex-end" : "flex-start",
    background: isUser ? "rgba(22,119,255,0.12)" : "var(--surface)",
    borderRadius: 16,
    maxWidth: "min(100%, 560px)",
    width: "fit-content",
  };

  return (
    <div key={message.id} style={alignmentStyle}>
      <Space
        direction="vertical"
        size={4}
        style={{
          alignItems: isUser ? "flex-end" : "flex-start",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <Typography.Text
          style={{
            alignSelf: isUser ? "flex-end" : "flex-start",
          }}
          type="secondary"
        >
          {message.timestamp}
        </Typography.Text>
        <Card
          style={bubbleStyle}
          styles={{
            body: { background: "transparent", padding: 16 },
          }}
        >
          <Space
            direction="vertical"
            size={8}
            style={{
              alignItems: isUser ? "flex-end" : "flex-start",
            }}
          >
            <Typography.Text strong>
              {isUser ? "我" : "AI 搭子"}
            </Typography.Text>
            <Typography.Paragraph
              style={{
                marginBottom: 0,
                textAlign: isUser ? "right" : "left",
              }}
            >
              {message.content}
            </Typography.Paragraph>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

const ChatContent = () => {
  const searchParams = useSearchParams();
  const activeSessionId = searchParams.get("session") ?? chatSessions[0].id;
  const activeSession = useMemo(() => {
    const matched = chatSessions.find(
      (session) => session.id === activeSessionId
    );
    return matched ?? chatSessions[0];
  }, [activeSessionId]);
  const activeMessages = messagesBySession[activeSession.id] ?? [];
  const activeTasks = planTasksBySession[activeSession.id] ?? [];
  const completedTasks = activeTasks.reduce(
    (count, task) => count + (task.status === "done" ? 1 : 0),
    0
  );
  const completionPercent =
    activeTasks.length === 0
      ? 0
      : // biome-ignore lint/style/noMagicNumbers: <percentage>
        Math.round((completedTasks / activeTasks.length) * 100);
  const [model, setModel] = useState(modelOptions[0].value);

  return (
    <div className="chat-layout">
      <section
        aria-label="历史对话"
        className="chat-section chat-section--left"
      >
        <Card title="历史对话" variant="borderless">
          <List
            dataSource={chatSessions}
            renderItem={(session) => {
              const isActive = session.id === activeSession.id;
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
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      href={`/chat?session=${session.id}`}
                    >
                      <Typography.Text strong>{session.title}</Typography.Text>
                    </Link>
                    <Typography.Text type="secondary">
                      {session.updatedAt} · {session.focus}
                    </Typography.Text>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Card>
      </section>
      <section
        aria-label="对话内容"
        className="chat-section chat-section--center"
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Typography.Title level={3}>{activeSession.title}</Typography.Title>
          <Card styles={{ body: { padding: 24 } }}>
            <div style={messageContainerStyle}>
              {activeMessages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
            </div>
          </Card>
          <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Space align="center" size={12} wrap>
                <Select
                  aria-label="选择对话模型"
                  onChange={(value) => setModel(value)}
                  options={modelOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  style={{ minWidth: 180 }}
                  value={model}
                />
                {conversationActions.map((action) => (
                  <Button
                    aria-label={`${action.label}:${action.description}`}
                    icon={action.icon}
                    key={action.key}
                    type="default"
                  >
                    {action.label}
                  </Button>
                ))}
              </Space>
              <Input.TextArea
                aria-label="输入新的学习问题"
                placeholder="请输入你的问题或学习内容..."
                rows={4}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button htmlType="button" type="primary">
                  发送
                </Button>
              </div>
            </Space>
          </Card>
        </Space>
      </section>
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
              dataSource={activeTasks}
              locale={{ emptyText: "暂无任务" }}
              renderItem={(task) => {
                let statusText = "待开始";
                let color = "default";
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
                        <Tag bordered={false}>截止：{task.dueDate}</Tag>
                      </Space>
                    </Space>
                  </List.Item>
                );
              }}
            />
          </Space>
        </Card>
      </section>
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
        <Typography.Text type="secondary">正在加载对话...</Typography.Text>
      </Space>
    }
  >
    <ChatContent />
  </Suspense>
);

export default ChatPage;
