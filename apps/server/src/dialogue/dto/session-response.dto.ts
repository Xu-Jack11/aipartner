export type MessageResponse = {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly createdAt: Date;
};

export type SessionResponse = {
  readonly id: string;
  readonly title: string;
  readonly focus: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type SessionWithMessagesResponse = SessionResponse & {
  readonly messages: readonly MessageResponse[];
};
