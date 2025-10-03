"use client";

import type { MenuProps } from "antd";
import { Button, Layout, Menu, Space, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import ThemeSwitcher from "./theme-switcher";

const headerStyle: CSSProperties = {
  alignItems: "center",
  background: "transparent",
  display: "flex",
  gap: 16,
  justifyContent: "space-between",
  paddingInline: 24,
};

const brandStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
};

const menuStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
};

const navigationItems: MenuProps["items"] = [
  {
    key: "home",
    label: <Link href="/">首页</Link>,
  },
  {
    key: "chat",
    label: <Link href="/chat">对话</Link>,
  },
  {
    key: "plan",
    label: <Link href="/plan">计划</Link>,
  },
  {
    key: "progress",
    label: <Link href="/progress">进度</Link>,
  },
  {
    key: "persona",
    label: <Link href="/persona">画像</Link>,
  },
];

const navigationMatchers = [
  {
    key: "home",
    match: (path: string) => path === "/",
  },
  {
    key: "chat",
    match: (path: string) => path.startsWith("/chat"),
  },
  {
    key: "plan",
    match: (path: string) => path.startsWith("/plan"),
  },
  {
    key: "progress",
    match: (path: string) => path.startsWith("/progress"),
  },
  {
    key: "persona",
    match: (path: string) => path.startsWith("/persona"),
  },
] as const;

const AppHeader = () => {
  const pathname = usePathname();
  const { user, status, logout } = useAuth();
  const activeKey = useMemo(() => {
    const matched = navigationMatchers.find((item) => item.match(pathname));
    return matched?.key ?? "home";
  }, [pathname]);

  return (
    <Layout.Header role="banner" style={headerStyle}>
      <Space align="center" size={16}>
        <Typography.Title level={4} style={brandStyle}>
          AI 学习搭子
        </Typography.Title>
      </Space>
      <nav aria-label="主导航" style={{ flex: 1 }}>
        <Menu
          items={navigationItems}
          mode="horizontal"
          selectedKeys={[activeKey]}
          style={menuStyle}
        />
      </nav>
      <Space align="center" size={12}>
        {status === "authenticated" && user ? (
          <Typography.Text aria-live="polite">
            欢迎，{user.displayName}
          </Typography.Text>
        ) : (
          <Link href="/login">登录</Link>
        )}
        {status === "authenticated" ? (
          <Button
            htmlType="button"
            onClick={logout}
            size="small"
            type="default"
          >
            退出
          </Button>
        ) : null}
        <ThemeSwitcher />
      </Space>
    </Layout.Header>
  );
};

export default AppHeader;
