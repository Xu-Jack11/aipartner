import { useCallback, useEffect, useState } from "react";
import type {
  MessageResponse,
  SessionWithMessagesResponse,
} from "../api/dialogue";
import { fetchSession, sendMessage as sendMessageApi } from "../api/dialogue";
import { useAuth } from "../auth-context";

type UseSessionMessagesResult = {
  readonly messages: readonly MessageResponse[];
  readonly isLoading: boolean;
  readonly error: string | undefined;
  readonly sendMessage: (
    content: string,
    options?: { readonly model?: string; readonly tools?: readonly string[] }
  ) => Promise<void>;
  readonly isSending: boolean;
};

export const useSessionMessages = (
  sessionId: string | undefined
): UseSessionMessagesResult => {
  const { accessToken } = useAuth();
  const [session, setSession] = useState<
    SessionWithMessagesResponse | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const shouldSkip = !(sessionId && accessToken);
    if (shouldSkip) {
      setSession(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    fetchSession(accessToken, sessionId)
      .then((data) => {
        setSession(data);
        setError(undefined);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "获取消息失败";
        setError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [sessionId, accessToken]);

  const sendMessage = useCallback(
    async (
      content: string,
      options?: { readonly model?: string; readonly tools?: readonly string[] }
    ) => {
      const cannotSend = !(sessionId && accessToken) || isSending;
      if (cannotSend) {
        return;
      }

      setIsSending(true);
      setError(undefined);

      try {
        // Add user message optimistically
        const userMessage: MessageResponse = {
          content,
          createdAt: new Date().toISOString(),
          id: `temp-${Date.now()}`,
          role: "user",
        };

        setSession((prev) =>
          prev
            ? { ...prev, messages: [...prev.messages, userMessage] }
            : undefined
        );

        // Send message and get AI response
        await sendMessageApi(accessToken, sessionId, {
          content,
          model: options?.model,
          tools: options?.tools,
        });

        // Refresh session to get updated messages
        const updatedSession = await fetchSession(accessToken, sessionId);
        setSession(updatedSession);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "发送消息失败";
        setError(message);

        // Refresh to get actual state on error
        if (accessToken && sessionId) {
          const updatedSession = await fetchSession(accessToken, sessionId);
          setSession(updatedSession);
        }
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, accessToken, isSending]
  );

  return {
    error,
    isLoading,
    isSending,
    messages: session?.messages ?? [],
    sendMessage,
  };
};
