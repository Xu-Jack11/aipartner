"use client";

import { Layout } from "antd";
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
  const isChatRoute = useMemo(() => pathname.startsWith("/chat"), [pathname]);
  const contentStyle = useMemo(
    () => (isChatRoute ? chatContentStyle : baseContentStyle),
    [isChatRoute]
  );

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
