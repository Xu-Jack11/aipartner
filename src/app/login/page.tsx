"use client";

import { Button, Card, Form, Input, Space, Tabs, Typography } from "antd";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const EMAIL_PLACEHOLDER = "demo@example.com";
const PASSWORD_PLACEHOLDER = "至少 8 位密码";

const LoginPage = () => {
  const { login, register, status, error } = useAuth();
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState("login");

  const handleLogin = async () => {
    const values = await form.validateFields();
    await login(values.email, values.password);
  };

  const handleRegister = async () => {
    const values = await form.validateFields();
    await register(values.displayName, values.email, values.password);
  };

  return (
    <Space
      align="center"
      direction="vertical"
      style={{ width: "100%", padding: "64px 16px" }}
    >
      <Card style={{ maxWidth: 420, width: "100%" }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Title
            level={3}
            style={{ marginBottom: 0, textAlign: "center" }}
          >
            欢迎使用 AI 学习搭子
          </Typography.Title>
          <Tabs
            activeKey={activeKey}
            centered
            items={[
              { key: "login", label: "登录" },
              { key: "register", label: "注册" },
            ]}
            onChange={(key) => {
              setActiveKey(key);
              form.resetFields();
            }}
          />
          <Form form={form} layout="vertical" requiredMark={false}>
            {activeKey === "register" ? (
              <Form.Item
                label="昵称"
                name="displayName"
                rules={[{ required: true, message: "请输入昵称" }]}
              >
                <Input maxLength={50} placeholder="请输入昵称" />
              </Form.Item>
            ) : null}
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: "请输入邮箱" },
                { type: "email", message: "邮箱格式不正确" },
              ]}
            >
              <Input placeholder={EMAIL_PLACEHOLDER} type="email" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 8, message: "密码长度至少 8 位" },
              ]}
            >
              <Input.Password placeholder={PASSWORD_PLACEHOLDER} />
            </Form.Item>
            {error ? (
              <Typography.Text type="danger">{error}</Typography.Text>
            ) : null}
            <Button
              block
              htmlType="button"
              loading={status === "loading"}
              onClick={activeKey === "login" ? handleLogin : handleRegister}
              size="large"
              type="primary"
            >
              {activeKey === "login" ? "登录" : "注册并登录"}
            </Button>
          </Form>
        </Space>
      </Card>
    </Space>
  );
};

export default LoginPage;
