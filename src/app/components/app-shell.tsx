"use client";

import { Grid, Layout } from "antd";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import AppHeader from "./app-header";

const baseContentStyle: CSSProperties = {
  margin: "0 auto",
  maxWidth: 1280,
  padding: "32px 24px 48px",
  width: "100%",
};

const chatContentStyle: CSSProperties = {
  margin: 0,
  maxWidth: "none",
  padding: "24px 0 48px",
  width: "100%",
};

const layoutStyle: CSSProperties = {
  minHeight: "100vh",
};

const AppShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const screens = Grid.useBreakpoint();
  const isChatRoute = useMemo(() => pathname.startsWith("/chat"), [pathname]);
  const isMobile = !screens.md;
  const contentStyle = useMemo(() => {
    if (isChatRoute) {
      return {
        ...chatContentStyle,
        padding: isMobile ? "16px 0 32px" : chatContentStyle.padding,
      } satisfies CSSProperties;
    }
    return {
      ...baseContentStyle,
      padding: isMobile ? "24px 16px 36px" : baseContentStyle.padding,
    } satisfies CSSProperties;
  }, [isChatRoute, isMobile]);

  return (
    <Layout style={layoutStyle}>
      <AppHeader />
      <Layout.Content role="main" style={contentStyle}>
        {children}
      </Layout.Content>
    </Layout>
  );
};

export default AppShell;
