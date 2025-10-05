"use client";

import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  addTaskToPlan,
  completeTask,
  deletePlan,
  fetchPlans,
  updatePlan,
  updatePlanTask,
} from "@/lib/api/planning";
import { useAuth } from "@/lib/auth-context";
import type {
  CreateTaskDto,
  PlanResponse,
  UpdatePlanDto,
} from "@/types/planning";
import styles from "./plan.module.css";

const PERCENTAGE_MULTIPLIER = 100;
const { Title, Text, Paragraph } = Typography;

const PlanCard = ({
  plan,
  onEdit,
  onAddTask,
  onToggleTask,
  onDelete,
  onCompletePlan,
}: {
  readonly plan: PlanResponse;
  readonly onEdit: (plan: PlanResponse) => void;
  readonly onAddTask: (plan: PlanResponse) => void;
  readonly onToggleTask: (
    planId: string,
    taskId: string,
    currentStatus: string
  ) => void;
  readonly onDelete: (planId: string) => void;
  readonly onCompletePlan: (planId: string) => void;
}) => {
  const completion = Math.round(
    plan.targetSteps > 0
      ? (plan.completedSteps / plan.targetSteps) * PERCENTAGE_MULTIPLIER
      : 0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "active":
        return "blue";
      default:
        return "default";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "active":
        return "进行中";
      default:
        return "待开始";
    }
  };

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case "done":
        return "已完成";
      default:
        return "待完成";
    }
  };

  return (
    <Card
      extra={
        <Space wrap>
          <Button onClick={() => onEdit(plan)} size="small">
            编辑
          </Button>
          <Button onClick={() => onAddTask(plan)} size="small" type="dashed">
            添加任务
          </Button>
          {plan.status !== "completed" && (
            <Popconfirm
              cancelText="取消"
              description="确认将此计划标记为已完成？"
              okText="确认"
              onConfirm={() => onCompletePlan(plan.id)}
              title="完成计划"
            >
              <Button size="small" type="primary">
                完成计划
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            cancelText="取消"
            description="删除后将无法恢复，确认删除此计划？"
            okText="删除"
            okType="danger"
            onConfirm={() => onDelete(plan.id)}
            title="确认删除"
          >
            <Button danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
      title={
        <Space>
          <Text strong>{plan.title}</Text>
          <Tag color={getStatusColor(plan.status)}>
            {getStatusText(plan.status)}
          </Tag>
        </Space>
      }
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Text strong>学习焦点</Text>
          <Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
            {plan.focus}
          </Paragraph>
        </div>

        {plan.dueDate ? (
          <Tag bordered={false}>
            截止日期：{dayjs(plan.dueDate).format("YYYY-MM-DD")}
          </Tag>
        ) : null}

        <div>
          <div className={styles.progressHeader}>
            <Text strong>学习进度</Text>
            <Text>
              {plan.completedSteps} / {plan.targetSteps}
            </Text>
          </div>
          <Progress percent={completion} showInfo />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            任务列表
          </Text>
          <List
            dataSource={[...plan.tasks]}
            locale={{ emptyText: "暂无任务" }}
            renderItem={(task) => (
              <List.Item
                actions={[
                  <Tag color={getTaskStatusColor(task.status)} key="status">
                    {getTaskStatusText(task.status)}
                  </Tag>,
                ]}
                key={task.id}
              >
                <Checkbox
                  checked={task.status === "done"}
                  onChange={() => onToggleTask(plan.id, task.id, task.status)}
                >
                  <span
                    className={
                      task.status === "done" ? styles.taskCompleted : ""
                    }
                  >
                    {task.summary}
                  </span>
                </Checkbox>
              </List.Item>
            )}
            size="small"
          />
        </div>
      </Space>
    </Card>
  );
};

const PlanPage = () => {
  const { accessToken, status: authStatus } = useAuth();
  const { message } = App.useApp();

  const [plans, setPlans] = useState<readonly PlanResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanResponse | null>(null);
  const [editForm] = Form.useForm();
  const [taskForm] = Form.useForm();

  const loadPlans = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    try {
      const data = await fetchPlans(accessToken);
      setPlans(data);
    } catch {
      message.error("加载学习计划失败");
    } finally {
      setLoading(false);
    }
  }, [accessToken, message]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      loadPlans().catch(() => {
        message.error("加载学习计划失败");
      });
    }
  }, [authStatus, loadPlans, message]);

  const handleEdit = (plan: PlanResponse) => {
    setCurrentPlan(plan);
    editForm.setFieldsValue({
      title: plan.title,
      focus: plan.focus,
      status: plan.status,
      dueDate: plan.dueDate ? dayjs(plan.dueDate) : null,
    });
    setEditModalVisible(true);
  };

  const handleAddTask = (plan: PlanResponse) => {
    setCurrentPlan(plan);
    taskForm.resetFields();
    setAddTaskModalVisible(true);
  };

  const handleToggleTask = async (
    planId: string,
    taskId: string,
    currentStatus: string
  ) => {
    if (!accessToken) {
      return;
    }

    try {
      if (currentStatus === "done") {
        // 如果任务已完成，将其标记为待开始(取消完成)
        await updatePlanTask(accessToken, planId, taskId, {
          status: "pending",
          completedAt: undefined,
        });
        message.success("已取消完成");
      } else {
        // 否则标记为完成
        await completeTask(accessToken, planId, taskId);
        message.success("任务已完成");
      }
      await loadPlans();
    } catch {
      message.error("更新任务状态失败");
    }
  };

  const handleEditSubmit = async (values: UpdatePlanDto) => {
    if (!(accessToken && currentPlan)) {
      return;
    }

    try {
      await updatePlan(accessToken, currentPlan.id, {
        ...values,
        dueDate: values.dueDate
          ? dayjs(values.dueDate).toISOString()
          : undefined,
      });
      await loadPlans();
      setEditModalVisible(false);
      message.success("更新计划成功");
    } catch {
      message.error("更新计划失败");
    }
  };

  const handleAddTaskSubmit = async (values: CreateTaskDto) => {
    if (!(accessToken && currentPlan)) {
      return;
    }

    try {
      await addTaskToPlan(accessToken, currentPlan.id, values);
      await loadPlans();
      setAddTaskModalVisible(false);
      message.success("添加任务成功");
    } catch {
      message.error("添加任务失败");
    }
  };

  const handleDeletePlan = useCallback(
    async (planId: string) => {
      if (!accessToken) {
        message.error("请先登录");
        return;
      }

      try {
        await deletePlan(accessToken, planId);
        message.success("学习计划已删除");
        await loadPlans();
      } catch {
        message.error("删除学习计划失败");
      }
    },
    [accessToken, loadPlans, message]
  );

  const handleCompletePlan = useCallback(
    async (planId: string) => {
      if (!accessToken) {
        message.error("请先登录");
        return;
      }

      try {
        await updatePlan(accessToken, planId, { status: "completed" });
        message.success("学习计划已标记为完成");
        await loadPlans();
      } catch {
        message.error("完成学习计划失败");
      }
    },
    [accessToken, loadPlans, message]
  );

  if (authStatus === "loading") {
    return (
      <div className={styles.emptyState}>
        <Spin size="large" />
      </div>
    );
  }

  if (authStatus !== "authenticated") {
    return (
      <Alert
        description={
          <div>
            您需要先登录才能查看学习计划。{" "}
            <Link href="/login">点击这里登录</Link>
          </div>
        }
        message="请先登录"
        showIcon
        type="warning"
      />
    );
  }

  return (
    <div className={styles.planContainer}>
      <div className={styles.planHeader}>
        <Title level={2}>我的学习计划</Title>
      </div>

      <Spin spinning={loading}>
        {plans.length === 0 ? (
          <div className={styles.emptyStateContent}>
            <Empty description="暂无学习计划" />
            <div className={styles.emptyStateActions}>
              <p>开始一个对话来创建您的第一个学习计划</p>
              <Link href="/chat">
                <Button type="primary">开始对话</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                onAddTask={handleAddTask}
                onCompletePlan={handleCompletePlan}
                onDelete={handleDeletePlan}
                onEdit={handleEdit}
                onToggleTask={handleToggleTask}
                plan={plan}
              />
            ))}
          </div>
        )}
      </Spin>

      {/* 编辑计划模态框 */}
      <Modal
        cancelText="取消"
        okText="保存"
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        open={editModalVisible}
        title="编辑学习计划"
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            label="计划标题"
            name="title"
            rules={[{ required: true, message: "请输入计划标题" }]}
          >
            <Input placeholder="请输入计划标题" />
          </Form.Item>
          <Form.Item
            label="学习焦点"
            name="focus"
            rules={[{ required: true, message: "请输入学习焦点" }]}
          >
            <Input.TextArea placeholder="请输入学习焦点" rows={3} />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select>
              <Select.Option value="pending">待开始</Select.Option>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="截止日期" name="dueDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加任务模态框 */}
      <Modal
        cancelText="取消"
        okText="添加"
        onCancel={() => setAddTaskModalVisible(false)}
        onOk={() => taskForm.submit()}
        open={addTaskModalVisible}
        title="添加新任务"
      >
        <Form form={taskForm} layout="vertical" onFinish={handleAddTaskSubmit}>
          <Form.Item
            label="任务描述"
            name="summary"
            rules={[{ required: true, message: "请输入任务描述" }]}
          >
            <Input placeholder="请输入任务描述" />
          </Form.Item>
          <Form.Item label="截止日期" name="dueDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanPage;
