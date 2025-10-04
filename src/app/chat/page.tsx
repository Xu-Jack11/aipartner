"use client";

import {
  BookOutlined,
  BulbOutlined,
  DeleteOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
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
import { useRouter, useSearchParams } from "next/navigation";
import type { KeyboardEvent } from "react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { MessageResponse } from "@/lib/api/dialogue";
import {
  createSession,
  deleteSession,
  sendMessage as sendMessageApi,
} from "@/lib/api/dialogue";
import type {
  ChatSessionResponse,
  LearningPlanResponse,
  LearningTaskResponse,
} from "@/lib/api/learning";
import { generatePlanFromSession } from "@/lib/api/planning";
import { useAuth } from "@/lib/auth-context";
import { useLearningSummary } from "@/lib/hooks/use-learning-summary";
import { useSessionMessages } from "@/lib/hooks/use-session-messages";
import styles from "./chat.module.css";

const PERCENTAGE_MULTIPLIER = 100;
const TEMP_SESSION_PREFIX = "temp-";

type TempSession = {
  id: string;
  title: string;
  focus: string;
  isTemp: true;
  messages: MessageResponse[];
};

type ActiveSession = ChatSessionResponse | TempSession;

const isTempSession = (
  session: ActiveSession | undefined
): session is TempSession =>
  session !== undefined && "isTemp" in session && session.isTemp;

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

type ModelOption = {
  readonly value: string;
  readonly label: string;
  readonly description: string;
  readonly capabilities: readonly string[];
  readonly contextWindow: string;
  readonly useCases: string;
};

const modelOptions: readonly ModelOption[] = [
  {
    capabilities: ["高性价比", "快速响应"],
    contextWindow: "128K tokens",
    description: "适合日常问答、课程总结与轻量推理任务，响应速度最快。",
    label: "GPT-4o mini",
    useCases: "即时解答、学习卡片、知识点梳理",
    value: "gpt-4o-mini",
  },
  {
    capabilities: ["高精度", "长上下文推理"],
    contextWindow: "128K tokens",
    description: "旗舰通用模型，适合深入分析、方案规划与复杂问题求解。",
    label: "GPT-4o",
    useCases: "深度问答、学习计划设计、复杂任务拆解",
    value: "gpt-4o",
  },
];

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
  onNewChat,
  onDeleteSession,
}: {
  readonly sessions: readonly ChatSessionResponse[];
  readonly activeSessionId: string;
  readonly onNewChat: () => void;
  readonly onDeleteSession: (sessionId: string) => void;
}) => {
  const { modal } = App.useApp();

  const handleDelete = useCallback(
    (sessionId: string, sessionTitle: string) => {
      modal.confirm({
        cancelText: "取消",
        content: `确定要删除对话「${sessionTitle}」吗?此操作无法撤销。`,
        okText: "删除",
        okType: "danger",
        onOk: () => {
          onDeleteSession(sessionId);
        },
        title: "删除对话",
      });
    },
    [modal, onDeleteSession]
  );

  return (
    <section aria-label="历史对话" className="chat-section chat-section--left">
      <Card
        extra={
          <Button onClick={onNewChat} size="small" type="primary">
            新建对话
          </Button>
        }
        title="历史对话"
        variant="borderless"
      >
        <List
          dataSource={[...sessions]}
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
                  <Space
                    align="center"
                    size={8}
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      href={{
                        pathname: "/chat",
                        query: { session: session.id },
                      }}
                    >
                      <Typography.Text strong>{session.title}</Typography.Text>
                    </Link>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(session.id, session.title);
                      }}
                      size="small"
                      type="text"
                    />
                  </Space>
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
};

const ChatTaskList = ({
  plan,
  sessionId,
  onPlanGenerated,
}: {
  readonly plan?: LearningPlanResponse;
  readonly sessionId?: string;
  readonly onPlanGenerated?: () => void;
}) => {
  const { message } = App.useApp();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = useCallback(async () => {
    if (sessionId === undefined) {
      message.warning("请先开始对话");
      return;
    }
    if (accessToken === undefined) {
      message.error("登录已过期，请重新登录");
      return;
    }

    try {
      setIsGenerating(true);
      await generatePlanFromSession(accessToken, { sessionId });
      message.success("学习计划生成成功");
      onPlanGenerated?.();
      router.push("/plan");
    } catch {
      message.error("生成学习计划失败");
    } finally {
      setIsGenerating(false);
    }
  }, [accessToken, message, onPlanGenerated, router, sessionId]);

  const completionPercent = calculateTaskCompletion(plan);

  return (
    <section
      aria-label="学习计划待办"
      className="chat-section chat-section--right"
    >
      <Card
        extra={
          <Button
            disabled={sessionId === undefined || isGenerating}
            loading={isGenerating}
            onClick={handleGeneratePlan}
            size="small"
            type="primary"
          >
            生成计划
          </Button>
        }
        title="学习计划待办"
        variant="borderless"
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Progress
            aria-label={`当前学习计划完成率${completionPercent}%`}
            percent={completionPercent}
            showInfo
          />
          <List
            dataSource={
              plan?.tasks ? ([...plan.tasks] as LearningTaskResponse[]) : []
            }
            locale={{ emptyText: "暂无任务" }}
            renderItem={(task) => {
              let statusText = "待开始";
              let color: "default" | "processing" | "success" = "default";
              if (task.status === "done") {
                statusText = "已完成";
                color = "success";
              } else if (task.status === "in_progress") {
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

const MessageList = ({
  messages,
  isLoading,
}: {
  readonly messages: readonly MessageResponse[];
  readonly isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <Card>
        <div className={styles.messageContainer}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <div className={styles.messageContainer}>
          <Typography.Text type="secondary">
            开始您的对话，问我任何学习相关的问题吧！
          </Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <List
        dataSource={[...messages]}
        renderItem={(message) => (
          <List.Item key={message.id}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Space align="center" size={8}>
                <Tag color={message.role === "user" ? "blue" : "green"}>
                  {message.role === "user" ? "我" : "AI助手"}
                </Tag>
                <Typography.Text type="secondary">
                  {new Date(message.createdAt).toLocaleString()}
                </Typography.Text>
              </Space>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {message.content}
              </Typography.Paragraph>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};

const ChatComposer = ({
  model,
  onModelChange,
  onSendMessage,
  isSending,
  disabled,
}: {
  readonly model: string;
  readonly onModelChange: (value: string) => void;
  readonly onSendMessage: (
    content: string,
    options?: { readonly model?: string; readonly tools?: readonly string[] }
  ) => void;
  readonly isSending: boolean;
  readonly disabled?: boolean;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const selectedModel = useMemo(
    () =>
      modelOptions.find((option) => option.value === model) ?? modelOptions[0],
    [model]
  );

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isSending && !disabled) {
      onSendMessage(trimmedValue, {
        model,
        tools: selectedTools.length > 0 ? selectedTools : undefined,
      });
      setInputValue("");
      // 保持工具选择状态,不重置
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleToolClick = (toolKey: string) => {
    setSelectedTools((prev) => {
      if (prev.includes(toolKey)) {
        return prev.filter((t) => t !== toolKey);
      }
      return [...prev, toolKey];
    });
  };

  return (
    <Card>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space align="center" size={12} wrap>
          <Space direction="vertical" size={4}>
            <Select
              aria-label="选择对话模型"
              disabled={disabled}
              dropdownMatchSelectWidth={360}
              onChange={onModelChange}
              optionLabelProp="label"
              optionRender={(option) => {
                const data = option.data as ModelOption;
                return (
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>{data.label}</Typography.Text>
                    <Typography.Text style={{ fontSize: 12 }} type="secondary">
                      {data.description}
                    </Typography.Text>
                    <Space size={4} wrap>
                      {data.capabilities.map((capability) => (
                        <Tag bordered={false} key={capability}>
                          {capability}
                        </Tag>
                      ))}
                      <Tag bordered={false} key={`${data.value}-context`}>
                        上下文 {data.contextWindow}
                      </Tag>
                    </Space>
                    <Typography.Text style={{ fontSize: 12 }} type="secondary">
                      适用：{data.useCases}
                    </Typography.Text>
                  </Space>
                );
              }}
              options={modelOptions.map((option) => ({
                ...option,
                label: option.label,
                value: option.value,
              }))}
              style={{ minWidth: 220 }}
              value={model}
            />
            <Space size={4} wrap>
              {selectedModel.capabilities.map((capability) => (
                <Tag bordered={false} key={`active-${capability}`}>
                  {capability}
                </Tag>
              ))}
              <Tag bordered={false} key="active-context">
                上下文 {selectedModel.contextWindow}
              </Tag>
            </Space>
            <Typography.Text
              aria-live="polite"
              role="status"
              style={{ fontSize: 12 }}
              type="secondary"
            >
              适用场景：{selectedModel.useCases} · {selectedModel.description}
            </Typography.Text>
          </Space>
          {conversationActions.map((action) => (
            <Button
              aria-label={`${action.label}:${action.description}`}
              disabled={disabled}
              htmlType="button"
              icon={action.icon}
              key={action.key}
              onClick={() => {
                handleToolClick(action.key);
              }}
              type={selectedTools.includes(action.key) ? "primary" : "default"}
            >
              {action.label}
            </Button>
          ))}
        </Space>
        <Input.TextArea
          disabled={disabled}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "请先创建或选择一个对话..."
              : "请输入你的问题或学习内容... (Shift+Enter 换行)"
          }
          rows={4}
          value={inputValue}
        />
        <div className={styles.messageFooter}>
          <Button
            disabled={disabled || isSending || !inputValue.trim()}
            htmlType="button"
            loading={isSending}
            onClick={handleSend}
            type="primary"
          >
            发送
          </Button>
        </div>
      </Space>
    </Card>
  );
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: 聊天组件确实需要处理多种状态和交互,强制降低复杂度会损害可读性
const ChatContent = () => {
  const { status: authStatus, accessToken } = useAuth();
  const { data, status, error, refetch } = useLearningSummary();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const [model, setModel] = useState(modelOptions[0].value);
  const [tempSession, setTempSession] = useState<TempSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const sessions = data?.chatSessions ?? [];

  // 创建临时会话
  const createTempSession = useCallback((): TempSession => {
    const tempId = `${TEMP_SESSION_PREFIX}${Date.now()}`;
    return {
      focus: "通用",
      id: tempId,
      isTemp: true,
      messages: [],
      title: "新对话",
    };
  }, []);

  // 初始化:如果没有会话且没有临时会话,创建一个临时会话
  useEffect(() => {
    const sessionId = searchParams.get("session");
    const hasNoSession = sessionId === null;
    const hasNoTempSession = tempSession === null;
    const hasNoSessions = sessions.length === 0;
    const shouldCreateTemp = hasNoSession && hasNoTempSession && hasNoSessions;

    if (shouldCreateTemp) {
      setTempSession(createTempSession());
    }
  }, [searchParams, tempSession, sessions.length, createTempSession]);

  // 处理新建对话
  const handleNewChat = useCallback(() => {
    const newTemp = createTempSession();
    setTempSession(newTemp);
    router.push(`/chat?session=${newTemp.id}`);
  }, [createTempSession, router]);

  // 确定当前活动会话
  const activeSessionId = searchParams.get("session") ?? tempSession?.id ?? "";
  const activeSession: ActiveSession | undefined = useMemo(() => {
    if (!activeSessionId) {
      return;
    }

    // 检查是否是临时会话
    const isTempSessionId = activeSessionId.startsWith(TEMP_SESSION_PREFIX);
    if (isTempSessionId) {
      return tempSession ?? undefined;
    }

    // 查找真实会话
    return sessions.find((session) => session.id === activeSessionId);
  }, [activeSessionId, sessions, tempSession]);

  const isTemp = isTempSession(activeSession);

  const activePlan = useMemo(() => {
    // 临时会话没有学习计划
    if (isTemp || !activeSession || !data) {
      return;
    }
    return data.learningPlans.find(
      (plan) => plan.sessionId === activeSession.id
    );
  }, [activeSession, data, isTemp]);

  const {
    messages: realMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
    sendMessage: sendRealMessage,
    isSending,
  } = useSessionMessages(isTemp ? undefined : activeSession?.id);

  // 临时会话的消息
  const messages = isTemp && tempSession ? tempSession.messages : realMessages;

  // 处理临时会话的消息发送
  const handleTempSessionMessage = useCallback(
    async (
      session: TempSession,
      content: string,
      options?: { readonly model?: string; readonly tools?: readonly string[] }
    ) => {
      if (!accessToken) {
        return;
      }

      setIsCreatingSession(true);
      try {
        // 1. 创建真实会话(使用默认标题,后续可由AI总结更新)
        const newSession = await createSession(accessToken, {
          focus: session.focus,
          title: "新对话",
        });

        // 2. 发送消息到新会话
        await sendMessageApi(accessToken, newSession.id, {
          content,
          model: options?.model,
          tools: options?.tools,
        });

        // 3. 清除临时会话
        setTempSession(null);

        // 4. 刷新会话列表(等待完成,确保新会话在列表中)
        await refetch();

        // 5. 跳转到新会话(不重载页面)
        router.push(`/chat?session=${newSession.id}`);
      } catch {
        // 创建会话或发送消息失败
        // 可以在这里显示错误提示
      } finally {
        setIsCreatingSession(false);
      }
    },
    [accessToken, refetch, router]
  );

  // 处理发送消息
  const handleSendMessage = useCallback(
    async (
      content: string,
      options?: { readonly model?: string; readonly tools?: readonly string[] }
    ) => {
      if (!(activeSession && accessToken)) {
        return;
      }

      if (isTempSession(activeSession)) {
        await handleTempSessionMessage(activeSession, content, options);
      } else {
        // 真实会话:直接发送
        await sendRealMessage(content, options);
      }
    },
    [activeSession, accessToken, handleTempSessionMessage, sendRealMessage]
  );

  // 删除会话
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (!accessToken) {
        message.error("请先登录");
        return;
      }

      try {
        await deleteSession(accessToken, sessionId);
        message.success("对话已删除");

        // 刷新会话列表并处理当前会话的变更
        const isCurrentSession = sessionId === activeSession?.id;
        if (isCurrentSession) {
          handleNewChat();
        } else {
          await refetch();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "删除对话失败";
        message.error(errorMessage);
        // biome-ignore lint/suspicious/noConsole: 需要输出错误信息用于调试
        console.error("删除会话失败:", err);
      }
    },
    [accessToken, activeSession?.id, handleNewChat, message, refetch]
  );

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

  // 显示完整的对话界面
  return (
    <div className="chat-layout">
      <ChatSidebar
        activeSessionId={activeSession?.id ?? ""}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        sessions={sessions}
      />
      <section
        aria-label="对话内容"
        className="chat-section chat-section--center"
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Typography.Title level={3}>
            {activeSession?.title ?? "AI学习助手"}
          </Typography.Title>
          {isTemp ? (
            <Alert
              message="这是一个新对话,发送第一条消息后将自动保存"
              showIcon
              type="info"
            />
          ) : null}
          {messagesError ? (
            <Alert message={messagesError} showIcon type="error" />
          ) : null}
          <MessageList
            isLoading={isLoadingMessages && !isTemp}
            messages={messages}
          />
          <ChatComposer
            disabled={isCreatingSession}
            isSending={isSending || isCreatingSession}
            model={model}
            onModelChange={setModel}
            onSendMessage={handleSendMessage}
          />
        </Space>
      </section>
      <ChatTaskList
        onPlanGenerated={refetch}
        plan={activePlan}
        sessionId={isTemp ? undefined : activeSession?.id}
      />
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
