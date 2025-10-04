"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import styles from "./markdown-message.module.css";

type MarkdownMessageProps = {
  readonly content: string;
};

export const MarkdownMessage = ({ content }: MarkdownMessageProps) => (
  <div className={styles.markdown}>
    <ReactMarkdown
      components={{
        // 自定义代码块样式
        code({ className, children, ...props }) {
          const inline = !className;
          return inline ? (
            <code className={styles.inlineCode} {...props}>
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // 自定义链接样式
        a({ children, href, ...props }) {
          return (
            <a {...props} href={href} rel="noopener noreferrer" target="_blank">
              {children}
            </a>
          );
        },
      }}
      rehypePlugins={[rehypeHighlight]}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  </div>
);
