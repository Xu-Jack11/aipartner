# API Clients Documentation

This document provides an overview of all available frontend API client modules located in `src/lib/api/`.

## Overview

All API clients use the shared `apiFetch` function from `client.ts` which handles:
- Base URL configuration
- Bearer token authentication
- Request/response formatting
- Error handling

## Available Clients

### Authentication (`src/lib/api/auth.ts`)

Handles user authentication and profile management.

**Functions:**
- `login(payload: LoginRequest): Promise<AuthResultDto>`
  - Authenticates user with email and password
  - Returns access token and user profile
  
- `register(payload: LoginRequest & { displayName: string }): Promise<AuthResultDto>`
  - Creates new user account
  - Returns access token and user profile
  
- `fetchProfile(accessToken: string): Promise<AuthUserDto>`
  - Retrieves current user profile
  - Requires authentication

**Types:**
```typescript
type LoginRequest = {
  email: string;
  password: string;
}

type AuthUserDto = {
  id: string;
  email: string;
  displayName: string;
}

type AuthResultDto = {
  accessToken: string;
  user: AuthUserDto;
}
```

### Dialogue (`src/lib/api/dialogue.ts`)

Manages chat sessions and AI conversations.

**Functions:**
- `fetchSessions(accessToken: string): Promise<SessionResponse[]>`
  - Lists all chat sessions for current user
  
- `createSession(accessToken: string, data: CreateSessionRequest): Promise<SessionResponse>`
  - Creates new chat session
  
- `fetchSession(accessToken: string, sessionId: string): Promise<SessionWithMessagesResponse>`
  - Retrieves session with all messages
  
- `sendMessage(accessToken: string, sessionId: string, data: SendMessageRequest): Promise<MessageResponse>`
  - Sends message and receives AI response
  
- `deleteSession(accessToken: string, sessionId: string): Promise<void>`
  - Deletes chat session

**Types:**
```typescript
type SessionResponse = {
  id: string;
  title: string;
  focus: string;
  createdAt: string;
  updatedAt: string;
}

type MessageResponse = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

type CreateSessionRequest = {
  title: string;
  focus: string;
}

type SendMessageRequest = {
  content: string;
  model?: string;
  tools?: string[];
}
```

### Planning (`src/lib/api/planning.ts`)

Manages learning plans and tasks.

**Functions:**
- `fetchPlans(accessToken: string): Promise<PlanResponse[]>`
  - Lists all learning plans
  
- `createPlan(accessToken: string, dto: CreatePlanDto): Promise<PlanResponse>`
  - Creates new learning plan manually
  
- `generatePlanFromSession(accessToken: string, dto: GeneratePlanDto): Promise<PlanResponse>`
  - Generates plan from dialogue session using AI
  
- `updatePlan(accessToken: string, planId: string, dto: UpdatePlanDto): Promise<PlanResponse>`
  - Updates plan metadata
  
- `deletePlan(accessToken: string, planId: string): Promise<void>`
  - Deletes learning plan
  
- `addTaskToPlan(accessToken: string, planId: string, dto: CreateTaskDto): Promise<PlanResponse>`
  - Adds task to existing plan
  
- `updatePlanTask(accessToken: string, planId: string, taskId: string, dto: UpdateTaskDto): Promise<PlanResponse>`
  - Updates task status/metadata
  
- `completeTask(accessToken: string, planId: string, taskId: string): Promise<PlanResponse>`
  - Helper function to mark task as complete

### Progress (`src/lib/api/progress.ts`)

Tracks study sessions and learning progress.

**Functions:**
- `fetchProgressStats(accessToken: string): Promise<ProgressStatsResponse>`
  - Retrieves comprehensive progress statistics
  
- `fetchStudySessions(accessToken: string, limit?: number): Promise<StudySessionResponse[]>`
  - Lists study sessions with optional limit
  
- `createStudySession(accessToken: string, dto: CreateStudySessionDto): Promise<StudySessionResponse>`
  - Records new study session
  
- `fetchProgressTrend(accessToken: string, days?: number): Promise<ProgressTrendResponse>`
  - Retrieves learning trend data (default: 30 days)

**Types:**
```typescript
type StudySessionResponse = {
  id: string;
  userId: string;
  sessionId: string | null;
  focus: string;
  minutes: number;
  recordedAt: string;
  createdAt: string;
}

type ProgressStatsResponse = {
  streakDays: number;
  totalCompletedTasks: number;
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  totalStudyMinutes: number;
  activeDays: number;
  avgDailyMinutes: number;
  recentSessions: StudySessionResponse[];
  latestSnapshot: ProgressSnapshotResponse | null;
}

type TrendDataPoint = {
  date: string;
  minutes: number;
  completedTasks: number;
}

type ProgressTrendResponse = {
  days: number;
  dataPoints: TrendDataPoint[];
}
```

### Learning (`src/lib/api/learning.ts`)

Provides aggregated learning summary view.

**Functions:**
- `fetchLearningSummary(accessToken: string): Promise<LearningSummaryResponse>`
  - Retrieves comprehensive learning overview including profile, plans, sessions, and metrics

**Types:**
```typescript
type LearningSummaryResponse = {
  learnerProfile: {
    name: string;
    learningGoal: string;
    recentFocus: string;
  };
  learningPlans: LearningPlanResponse[];
  studySessions: StudySessionResponse[];
  metrics: {
    weeklyHours: number;
    totalCompletedSteps: number;
    streakDays: number;
  };
  chatSessions: ChatSessionResponse[];
}
```

### AI Models (`src/lib/api/models.ts`)

Retrieves available AI models from configured provider.

**Functions:**
- `fetchModels(accessToken: string): Promise<ModelsResponse>`
  - Lists available AI models

**Types:**
```typescript
type ModelInfo = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

type ModelsResponse = {
  object: string;
  data: ModelInfo[];
}
```

## Usage Examples

### Authentication Flow
```typescript
import { login, fetchProfile } from '@/lib/api/auth';

// Login
const { accessToken, user } = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Store token and use for subsequent requests
const profile = await fetchProfile(accessToken);
```

### Creating Chat Session and Sending Message
```typescript
import { createSession, sendMessage } from '@/lib/api/dialogue';

const session = await createSession(accessToken, {
  title: 'Learning Python',
  focus: 'python basics'
});

const response = await sendMessage(accessToken, session.id, {
  content: 'How do I start learning Python?',
  model: 'gpt-4o'
});
```

### Tracking Study Progress
```typescript
import { createStudySession, fetchProgressStats } from '@/lib/api/progress';

// Record study session
await createStudySession(accessToken, {
  sessionId: 'session-123',
  focus: 'Python practice',
  minutes: 45
});

// Check updated statistics
const stats = await fetchProgressStats(accessToken);
console.log(`Current streak: ${stats.streakDays} days`);
```

### Managing Learning Plans
```typescript
import { generatePlanFromSession, updatePlanTask } from '@/lib/api/planning';

// Generate plan from dialogue
const plan = await generatePlanFromSession(accessToken, {
  sessionId: 'session-123',
  title: 'Python Learning Plan',
  targetSteps: 10
});

// Mark task as complete
await updatePlanTask(accessToken, plan.id, 'task-1', {
  status: 'done',
  completedAt: new Date().toISOString()
});
```

## Error Handling

All API clients throw errors on failure. It's recommended to wrap calls in try-catch blocks:

```typescript
try {
  const sessions = await fetchSessions(accessToken);
  // Handle success
} catch (error) {
  console.error('Failed to fetch sessions:', error);
  // Handle error
}
```

## Authentication

All API endpoints except `login` and `register` require authentication. Pass the access token received from login/register to authenticated endpoints:

```typescript
const { accessToken } = await login({ email, password });
const sessions = await fetchSessions(accessToken);
```

## Related Documentation

- [API Reference](./api-reference.md) - Complete backend API documentation
- [Dialogue Implementation](./dialogue-implementation-summary.md) - Dialogue module details
- [Progress Module](./progress-module-implementation.md) - Progress tracking details
- [Model List Feature](./model-list-refresh-feature.md) - AI models feature details
