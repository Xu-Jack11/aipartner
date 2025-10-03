import { apiFetch } from "./client";

export type MessageResponse = {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly createdAt: string;
};

export type SessionResponse = {
  readonly id: string;
  readonly title: string;
  readonly focus: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SessionWithMessagesResponse = SessionResponse & {
  readonly messages: readonly MessageResponse[];
};

export type CreateSessionRequest = {
  readonly title: string;
  readonly focus: string;
};

export type SendMessageRequest = {
  readonly content: string;
  readonly model?: string;
  readonly tools?: readonly string[];
};

export const fetchSessions = (
  accessToken: string
): Promise<readonly SessionResponse[]> =>
  apiFetch<readonly SessionResponse[]>("v1/dialogue/sessions", {
    accessToken,
    method: "GET",
  });

export const createSession = (
  accessToken: string,
  data: CreateSessionRequest
): Promise<SessionResponse> =>
  apiFetch<SessionResponse>("v1/dialogue/sessions", {
    accessToken,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

export const fetchSession = (
  accessToken: string,
  sessionId: string
): Promise<SessionWithMessagesResponse> =>
  apiFetch<SessionWithMessagesResponse>(`v1/dialogue/sessions/${sessionId}`, {
    accessToken,
    method: "GET",
  });

export const sendMessage = (
  accessToken: string,
  sessionId: string,
  data: SendMessageRequest
): Promise<MessageResponse> =>
  apiFetch<MessageResponse>(`v1/dialogue/sessions/${sessionId}/messages`, {
    accessToken,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
