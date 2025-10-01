"use client";

import type { MenuProps } from "antd";
import { Layout, Menu, Space, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
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
];

const AppHeader = () => {
  const pathname = usePathname();
  const activeKey = pathname.startsWith("/chat") ? "chat" : "home";

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
        <Typography.Text aria-live="polite">下午好，李华</Typography.Text>
        <ThemeSwitcher />
      </Space>
    </Layout.Header>
  );
};

export default AppHeader;
