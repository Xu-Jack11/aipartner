export type PlanTask = {
  readonly id: string;
  readonly summary: string;
  readonly status: "todo" | "in-progress" | "done";
  readonly dueDate: string;
};

export type LearningPlan = {
  readonly id: string;
  readonly sessionId: string;
  readonly title: string;
  readonly focus: string;
  readonly dueDate: string;
  readonly targetSteps: number;
  readonly completedSteps: number;
  readonly tasks: readonly PlanTask[];
};

export type StudySession = {
  readonly id: string;
  readonly focus: string;
  readonly date: string;
  readonly minutes: number;
};

export type ChatMessage = {
  readonly id: string;
  readonly role: "assistant" | "user";
  readonly content: string;
  readonly timestamp: string;
};

export type ChatSession = {
  readonly id: string;
  readonly title: string;
  readonly focus: string;
  readonly updatedAt: string;
  readonly planId: string;
  readonly messages: readonly ChatMessage[];
};

export type LearnerProfile = {
  readonly name: string;
  readonly learningGoal: string;
  readonly recentFocus: string;
};

export const learnerProfile = {
  name: "\u674E\u534E",
  learningGoal:
    "\u8003\u7814\u82F1\u8BED\u51B2\u523A + \u6570\u5B66\u5DE9\u56FA",
  recentFocus:
    "\u7EBF\u6027\u4EE3\u6570\u6838\u5FC3\u6982\u5FF5\u3001\u9605\u8BFB\u7406\u89E3\u6280\u5DE7",
} as const satisfies LearnerProfile;

export const learningPlans = [
  {
    completedSteps: 5,
    dueDate: "2025-10-01",
    focus: "\u7EBF\u6027\u4EE3\u6570",
    id: "plan-linear",
    sessionId: "session-linear",
    targetSteps: 7,
    tasks: [
      {
        dueDate: "09-29",
        id: "task-1",
        status: "in-progress",
        summary:
          "\u6574\u7406\u77E9\u9635\u8FD0\u7B97\u516C\u5F0F\u5E76\u5B8C\u6210 2 \u9053\u4F8B\u9898",
      },
      {
        dueDate: "09-29",
        id: "task-2",
        status: "todo",
        summary:
          "\u5B8C\u6210\u7279\u5F81\u503C\u81EA\u6D4B\u9898\u5E76\u8BB0\u5F55\u9519\u9898",
      },
      {
        dueDate: "09-30",
        id: "task-3",
        status: "todo",
        summary:
          "\u603B\u7ED3\u7279\u5F81\u5411\u91CF\u5728\u5B9E\u9645\u95EE\u9898\u4E2D\u7684\u5E94\u7528",
      },
    ],
    title: "\u7EBF\u6027\u4EE3\u6570\u91CD\u70B9\u56DE\u987E",
  },
  {
    completedSteps: 3,
    dueDate: "2025-10-03",
    focus: "\u8003\u7814\u82F1\u8BED",
    id: "plan-english",
    sessionId: "session-english",
    targetSteps: 5,
    tasks: [
      {
        dueDate: "09-28",
        id: "task-4",
        status: "done",
        summary:
          "\u9605\u8BFB\u7406\u89E3\u7EC3\u4E60\u9898 2 \u7BC7\u5E76\u6574\u7406\u751F\u8BCD\u8868",
      },
      {
        dueDate: "09-29",
        id: "task-5",
        status: "in-progress",
        summary:
          "\u53E5\u6CD5\u6807\u6CE8\u8BAD\u7EC3\uFF08\u6BCF\u65E5 2 \u6BB5\uFF09",
      },
    ],
    title: "\u9605\u8BFB\u7406\u89E3\u5F3A\u5316\u7EC3\u4E60",
  },
  {
    completedSteps: 2,
    dueDate: "2025-10-05",
    focus: "\u6982\u7387\u7EDF\u8BA1",
    id: "plan-statistics",
    sessionId: "session-statistics",
    targetSteps: 6,
    tasks: [
      {
        dueDate: "09-28",
        id: "task-6",
        status: "in-progress",
        summary: "\u7ED8\u5236\u6B63\u6001\u62BD\u6837\u6D41\u7A0B\u56FE",
      },
      {
        dueDate: "09-29",
        id: "task-7",
        status: "todo",
        summary:
          "\u5B8C\u6210\u5361\u65B9\u5206\u5E03\u7EC3\u4E60\u9898 3 \u9053",
      },
    ],
    title: "\u6982\u7387\u8BBA\u7AE0\u8282\u590D\u4E60",
  },
] as const satisfies readonly LearningPlan[];

export const studySessions = [
  {
    date: "2025-09-28",
    focus: "\u7EBF\u6027\u4EE3\u6570\u4E60\u9898",
    id: "session-linear",
    minutes: 110,
  },
  {
    date: "2025-09-27",
    focus: "\u82F1\u8BED\u9605\u8BFB\u7406\u89E3",
    id: "session-english",
    minutes: 95,
  },
  {
    date: "2025-09-26",
    focus: "\u6982\u7387\u7EDF\u8BA1",
    id: "session-statistics",
    minutes: 80,
  },
  {
    date: "2025-09-25",
    focus: "\u7EBF\u6027\u4EE3\u6570\u77E5\u8BC6\u70B9\u68B3\u7406",
    id: "session-linear-review",
    minutes: 120,
  },
] as const satisfies readonly StudySession[];

export const chatSessions = [
  {
    focus: "\u7EBF\u6027\u4EE3\u6570",
    id: "session-linear",
    messages: [
      {
        content:
          "\u6211\u60F3\u68B3\u7406\u77E9\u9635\u8FD0\u7B97\u4E0E\u7279\u5F81\u503C\u7684\u91CD\u70B9\uFF0C\u6709\u6CA1\u6709\u5B66\u4E60\u5EFA\u8BAE\uFF1F",
        id: "msg-1",
        role: "user",
        timestamp: "09-28 20:55",
      },
      {
        content:
          "\u5148\u590D\u4E60\u77E9\u9635\u57FA\u672C\u8FD0\u7B97\uFF0C\u518D\u7ED3\u5408\u4F8B\u9898\u7406\u89E3\u7279\u5F81\u503C\u4E0E\u7279\u5F81\u5411\u91CF\u7684\u7269\u7406\u610F\u4E49\u3002\u5EFA\u8BAE\u6309\u6982\u5FF5 \u2192 \u4F8B\u9898 \u2192 \u5C0F\u6D4B\u9A8C\u7684\u987A\u5E8F\u63A8\u8FDB\u3002",
        id: "msg-2",
        role: "assistant",
        timestamp: "09-28 20:56",
      },
      {
        content:
          "\u53EF\u4EE5\u5B89\u6392\u4E00\u4E2A\u68C0\u6D4B\u9898\u5417\uFF1F",
        id: "msg-3",
        role: "user",
        timestamp: "09-28 20:58",
      },
      {
        content:
          "\u597D\u7684\uFF0C\u6211\u51C6\u5907\u4E86\u4E09\u9053\u7EC3\u4E60\u9898\uFF0C\u5E76\u5728\u53F3\u4FA7\u5F85\u529E\u6E05\u5355\u4E2D\u5217\u51FA\u3002\u5B8C\u6210\u540E\u544A\u8BC9\u6211\u4F60\u7684\u5F97\u5206\uFF0C\u6211\u4EEC\u518D\u8C03\u6574\u590D\u4E60\u7B56\u7565\u3002",
        id: "msg-4",
        role: "assistant",
        timestamp: "09-28 20:59",
      },
    ],
    planId: "plan-linear",
    title: "\u7EBF\u6027\u4EE3\u6570\u91CD\u70B9\u56DE\u987E",
    updatedAt: "09-28 21:10",
  },
  {
    focus: "\u8003\u7814\u82F1\u8BED",
    id: "session-english",
    messages: [
      {
        content:
          "\u957F\u96BE\u53E5\u8FD8\u662F\u8BFB\u4E0D\u987A\uFF0C\u80FD\u5E2E\u6211\u62C6\u89E3\u5417\uFF1F",
        id: "msg-5",
        role: "user",
        timestamp: "09-27 19:12",
      },
      {
        content:
          "\u5148\u8BC6\u522B\u4ECE\u53E5\u754C\u9650\uFF0C\u518D\u6293\u8C13\u8BED\u52A8\u8BCD\u3002\u63A8\u8350\u4F60\u6BCF\u5929\u5B8C\u6210\u4E24\u7BC7\u9605\u8BFB\u5E76\u6807\u6CE8\u53E5\u6CD5\u7ED3\u6784\uFF0C\u5177\u4F53\u7EC3\u4E60\u8BF7\u67E5\u770B\u5F85\u529E\u4E2D\u7684\u201C\u53E5\u6CD5\u6807\u6CE8\u201D\u4EFB\u52A1\u3002",
        id: "msg-6",
        role: "assistant",
        timestamp: "09-27 19:15",
      },
    ],
    planId: "plan-english",
    title: "\u9605\u8BFB\u7406\u89E3\u5F3A\u5316\u7EC3\u4E60",
    updatedAt: "09-27 19:42",
  },
  {
    focus: "\u6982\u7387\u7EDF\u8BA1",
    id: "session-statistics",
    messages: [
      {
        content:
          "\u62BD\u6837\u5206\u5E03\u8FD9\u5757\u6709\u6CA1\u6709\u56FE\u5F62\u5316\u7684\u7406\u89E3\u65B9\u5F0F\uFF1F",
        id: "msg-7",
        role: "user",
        timestamp: "09-26 19:30",
      },
      {
        content:
          "\u5EFA\u8BAE\u5148\u7528\u6B63\u6001\u5206\u5E03\u7684\u62BD\u6837\u793A\u610F\u56FE\u7406\u89E3\uFF0C\u518D\u505A\u5361\u65B9\u5206\u5E03\u7684\u5BF9\u6BD4\u7EC3\u4E60\u3002\u6211\u5DF2\u5728\u5F85\u529E\u4E2D\u5B89\u6392\u201C\u7ED8\u5236\u62BD\u6837\u6D41\u7A0B\u56FE\u201D\u3002",
        id: "msg-8",
        role: "assistant",
        timestamp: "09-26 19:32",
      },
    ],
    planId: "plan-statistics",
    title: "\u6982\u7387\u8BBA\u7AE0\u8282\u590D\u4E60",
    updatedAt: "09-26 20:05",
  },
] as const satisfies readonly ChatSession[];
