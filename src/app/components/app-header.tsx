"use client";

import { MenuOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Button,
  Divider,
  Drawer,
  Grid,
  Layout,
  Menu,
  Space,
  Typography,
} from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
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

const drawerBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  paddingBlock: 24,
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
  const screens = Grid.useBreakpoint();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const activeKey = useMemo(() => {
    const matched = navigationMatchers.find((item) => item.match(pathname));
    return matched?.key ?? "home";
  }, [pathname]);

  const isMobile = !screens.md;

  const computedHeaderStyle = useMemo(
    () => ({
      ...headerStyle,
      gap: isMobile ? 12 : headerStyle.gap,
      paddingInline: isMobile ? 16 : headerStyle.paddingInline,
    }),
    [isMobile]
  );

  const closeDrawer = () => {
    setIsNavOpen(false);
  };

  const handleMenuClick: MenuProps["onClick"] = () => {
    if (isMobile) {
      closeDrawer();
    }
  };

  const userSection = (
    <Space align="center" size={12} wrap>
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
    </Space>
  );

  return (
    <Layout.Header role="banner" style={computedHeaderStyle}>
      <Space align="center" size={16}>
        <Typography.Title level={4} style={brandStyle}>
          AI 学习搭子
        </Typography.Title>
      </Space>
      {isMobile ? (
        <Space align="center" size={12}>
          <ThemeSwitcher />
          <Button
            aria-controls="main-navigation"
            aria-expanded={isNavOpen}
            aria-label="打开导航菜单"
            icon={<MenuOutlined />}
            onClick={() => {
              setIsNavOpen(true);
            }}
            type="text"
          />
          <Drawer
            afterOpenChange={(open) => {
              if (!open) {
                closeDrawer();
              }
            }}
            bodyStyle={drawerBodyStyle}
            onClose={closeDrawer}
            open={isNavOpen}
            placement="right"
            title="导航菜单"
          >
            <nav aria-label="主导航" id="main-navigation">
              <Menu
                items={navigationItems}
                mode="inline"
                onClick={handleMenuClick}
                selectedKeys={[activeKey]}
              />
            </nav>
            <Divider style={{ marginBlock: 0 }} />
            {userSection}
          </Drawer>
        </Space>
      ) : (
        <>
          <nav aria-label="主导航" style={{ flex: 1 }}>
            <Menu
              items={navigationItems}
              mode="horizontal"
              onClick={handleMenuClick}
              selectedKeys={[activeKey]}
              style={menuStyle}
            />
          </nav>
          <Space align="center" size={12}>
            {userSection}
            <ThemeSwitcher />
          </Space>
        </>
      )}
    </Layout.Header>
  );
};

export default AppHeader;
