# API Reference

## Overview
- Base URL: 
  - Production: `https://api.aipartner.example.com`
  - Development: `http://localhost:3000/api`
- Version: `v1` prefix on every path (example: `/v1/dialogue/sessions`).
- Authentication: Bearer token (JWT) in the `Authorization` header: `Authorization: Bearer <token>`
- Formats: JSON bodies encoded in UTF-8; timestamps in ISO 8601 with timezone.
- Rate limit: 120 requests/minute per user; 429 responses include `Retry-After` header.
- Error envelope:
  ```json
  {
    "error": {
      "code": "string",
      "message": "string",
      "details": {}
    }
  }
  ```

## Shared Conventions
- Pagination: `limit`, `cursor`, and `nextCursor` params for list endpoints.
- Idempotency: create/update endpoints accept optional `Idempotency-Key` header.
- Localization: optional `Accept-Language` header (default `zh-CN`).
- Observability: responses include `X-Request-Id`; clients should log for tracing.

## Domains

### Auth
Purpose: user registration, login, and profile management.

| Method | Path               | Summary                        | Auth Required |
| ------ | ------------------ | ------------------------------ | ------------- |
| POST   | `/v1/auth/register`| Create learner account         | No            |
| POST   | `/v1/auth/login`   | Exchange credentials for tokens| No            |
| GET    | `/v1/auth/profile` | Get current user profile       | Yes           |

#### POST `/v1/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

#### POST `/v1/auth/login`
Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

#### GET `/v1/auth/profile`
Get current authenticated user profile.

**Response (200 OK):**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

### Dialogue
Purpose: manage learner chat sessions and AI-generated responses.

| Method | Path                               | Summary                             | Auth Required |
| ------ | ---------------------------------- | ----------------------------------- | ------------- |
| GET    | `/v1/dialogue/sessions`            | List chat sessions for current user | Yes           |
| POST   | `/v1/dialogue/sessions`            | Create new session with metadata    | Yes           |
| GET    | `/v1/dialogue/sessions/{id}`       | Fetch session detail with messages  | Yes           |
| POST   | `/v1/dialogue/sessions/{id}/messages`| Submit learner message, get AI response | Yes   |
| DELETE | `/v1/dialogue/sessions/{id}`       | Delete a chat session               | Yes           |

#### GET `/v1/dialogue/sessions`
List all chat sessions for the authenticated user.

**Response (200 OK):**
```json
[
  {
    "id": "session-123",
    "title": "Learning Python",
    "focus": "python basics",
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T12:00:00Z"
  }
]
```

#### POST `/v1/dialogue/sessions`
Create a new chat session.

**Request Body:**
```json
{
  "title": "Learning Python",
  "focus": "python basics"
}
```

**Response (201 Created):**
```json
{
  "id": "session-123",
  "title": "Learning Python",
  "focus": "python basics",
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}
```

#### GET `/v1/dialogue/sessions/{id}`
Get session details including all messages.

**Response (200 OK):**
```json
{
  "id": "session-123",
  "title": "Learning Python",
  "focus": "python basics",
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "How do I start learning Python?",
      "createdAt": "2025-01-01T10:00:00Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Great question! Here's a step-by-step guide...",
      "createdAt": "2025-01-01T10:00:30Z"
    }
  ]
}
```

#### POST `/v1/dialogue/sessions/{id}/messages`
Send a message and get AI response.

**Request Body:**
```json
{
  "content": "How do I start learning Python?",
  "model": "gpt-4o",
  "tools": ["code_interpreter"]
}
```

**Response (201 Created):**
```json
{
  "id": "msg-2",
  "role": "assistant",
  "content": "Great question! Here's a step-by-step guide...",
  "createdAt": "2025-01-01T10:00:30Z"
}
```

#### DELETE `/v1/dialogue/sessions/{id}`
Delete a chat session and all its messages.

**Response (204 No Content)**

### Planning
Purpose: capture learning goals and manage auto-generated plans.

| Method | Path                                | Summary                                  | Auth Required |
| ------ | ----------------------------------- | ---------------------------------------- | ------------- |
| GET    | `/v1/plans`                         | List plans with completion status        | Yes           |
| POST   | `/v1/plans`                         | Create plan manually                     | Yes           |
| POST   | `/v1/plans/generate`                | Generate plan from dialogue session      | Yes           |
| PATCH  | `/v1/plans/{id}`                    | Update metadata (title, due date)        | Yes           |
| DELETE | `/v1/plans/{id}`                    | Delete a learning plan                   | Yes           |
| POST   | `/v1/plans/{id}/tasks`              | Add manual tasks                         | Yes           |
| PATCH  | `/v1/plans/{id}/tasks/{taskId}`     | Update task status/progress              | Yes           |

#### GET `/v1/plans`
List all learning plans for the authenticated user.

**Response (200 OK):**
```json
[
  {
    "id": "plan-123",
    "sessionId": "session-456",
    "title": "Python Fundamentals",
    "focus": "Learn Python basics",
    "dueDate": "2025-02-01T00:00:00Z",
    "status": "in_progress",
    "targetSteps": 10,
    "completedSteps": 3,
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-05T14:30:00Z",
    "tasks": [
      {
        "id": "task-1",
        "summary": "Learn Python syntax",
        "status": "done",
        "dueDate": "2025-01-10T00:00:00Z",
        "completedAt": "2025-01-08T15:00:00Z"
      },
      {
        "id": "task-2",
        "summary": "Build a simple calculator",
        "status": "in_progress",
        "dueDate": "2025-01-15T00:00:00Z"
      }
    ]
  }
]
```

#### POST `/v1/plans`
Create a new learning plan manually.

**Request Body:**
```json
{
  "title": "Python Fundamentals",
  "focus": "Learn Python basics",
  "dueDate": "2025-02-01T00:00:00Z",
  "tasks": [
    {
      "summary": "Learn Python syntax",
      "dueDate": "2025-01-10T00:00:00Z"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "plan-123",
  "title": "Python Fundamentals",
  "focus": "Learn Python basics",
  "dueDate": "2025-02-01T00:00:00Z",
  "status": "pending",
  "targetSteps": 1,
  "completedSteps": 0,
  "tasks": [...]
}
```

#### POST `/v1/plans/generate`
Generate a learning plan from a dialogue session using AI.

**Request Body:**
```json
{
  "sessionId": "session-456",
  "title": "Python Learning Plan",
  "targetSteps": 10
}
```

**Response (201 Created):**
```json
{
  "id": "plan-123",
  "sessionId": "session-456",
  "title": "Python Learning Plan",
  "focus": "Learn Python from basics to advanced",
  "status": "pending",
  "targetSteps": 10,
  "completedSteps": 0,
  "tasks": [...]
}
```

#### PATCH `/v1/plans/{id}`
Update plan metadata.

**Request Body:**
```json
{
  "title": "Updated Title",
  "dueDate": "2025-03-01T00:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "id": "plan-123",
  "title": "Updated Title",
  "dueDate": "2025-03-01T00:00:00Z",
  ...
}
```

#### DELETE `/v1/plans/{id}`
Delete a learning plan and all its tasks.

**Response (204 No Content)**

#### POST `/v1/plans/{id}/tasks`
Add a new task to an existing plan.

**Request Body:**
```json
{
  "summary": "Practice list comprehensions",
  "dueDate": "2025-01-20T00:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "plan-123",
  "tasks": [...],
  ...
}
```

#### PATCH `/v1/plans/{id}/tasks/{taskId}`
Update task status or metadata.

**Request Body:**
```json
{
  "status": "done",
  "completedAt": "2025-01-08T15:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "id": "plan-123",
  "completedSteps": 4,
  "tasks": [...],
  ...
}
```

### Progress
Purpose: track study time, sessions, statistics, and learning trends.

| Method | Path                       | Summary                                  | Auth Required |
| ------ | -------------------------- | ---------------------------------------- | ------------- |
| POST   | `/v1/progress/sessions`    | Create study session record              | Yes           |
| GET    | `/v1/progress/sessions`    | Get study session list with pagination   | Yes           |
| GET    | `/v1/progress/stats`       | Get learning progress statistics         | Yes           |
| GET    | `/v1/progress/trend`       | Get learning trend data over time        | Yes           |

#### POST `/v1/progress/sessions`
Create a study session record to track learning time.

**Request Body:**
```json
{
  "sessionId": "session-123",
  "focus": "Python practice",
  "minutes": 45,
  "recordedAt": "2025-01-05T14:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "study-session-789",
  "userId": "user-123",
  "sessionId": "session-123",
  "focus": "Python practice",
  "minutes": 45,
  "recordedAt": "2025-01-05T14:00:00Z",
  "createdAt": "2025-01-05T14:45:00Z"
}
```

#### GET `/v1/progress/sessions`
Get list of study sessions with optional limit.

**Query Parameters:**
- `limit` (optional): Maximum number of sessions to return (default: all)

**Example:** `GET /v1/progress/sessions?limit=20`

**Response (200 OK):**
```json
[
  {
    "id": "study-session-789",
    "userId": "user-123",
    "sessionId": "session-123",
    "focus": "Python practice",
    "minutes": 45,
    "recordedAt": "2025-01-05T14:00:00Z",
    "createdAt": "2025-01-05T14:45:00Z"
  },
  {
    "id": "study-session-788",
    "userId": "user-123",
    "sessionId": null,
    "focus": "JavaScript review",
    "minutes": 30,
    "recordedAt": "2025-01-04T10:00:00Z",
    "createdAt": "2025-01-04T10:30:00Z"
  }
]
```

#### GET `/v1/progress/stats`
Get comprehensive learning progress statistics.

**Response (200 OK):**
```json
{
  "streakDays": 7,
  "totalCompletedTasks": 25,
  "weeklyStudyMinutes": 180,
  "monthlyStudyMinutes": 720,
  "totalStudyMinutes": 1500,
  "activeDays": 30,
  "avgDailyMinutes": 50,
  "recentSessions": [
    {
      "id": "study-session-789",
      "focus": "Python practice",
      "minutes": 45,
      "recordedAt": "2025-01-05T14:00:00Z"
    }
  ],
  "latestSnapshot": {
    "id": "snapshot-1",
    "userId": "user-123",
    "streakDays": 7,
    "completedTasks": 25,
    "studyMinutes": 1500,
    "capturedAt": "2025-01-05T23:59:59Z"
  }
}
```

#### GET `/v1/progress/trend`
Get learning trend data for visualization.

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 30)

**Example:** `GET /v1/progress/trend?days=30`

**Response (200 OK):**
```json
{
  "days": 30,
  "dataPoints": [
    {
      "date": "2025-01-01",
      "minutes": 60,
      "completedTasks": 2
    },
    {
      "date": "2025-01-02",
      "minutes": 45,
      "completedTasks": 1
    },
    {
      "date": "2025-01-03",
      "minutes": 90,
      "completedTasks": 3
    }
  ]
}
```

### Learning
Purpose: aggregated view of learner's complete learning profile and progress.

| Method | Path                    | Summary                              | Auth Required |
| ------ | ----------------------- | ------------------------------------ | ------------- |
| GET    | `/v1/learning/summary`  | Get comprehensive learning summary   | Yes           |

#### GET `/v1/learning/summary`
Get a comprehensive summary of the learner's profile, plans, sessions, and metrics.

**Response (200 OK):**
```json
{
  "learnerProfile": {
    "name": "John Doe",
    "learningGoal": "Master full-stack development",
    "recentFocus": "Python and React"
  },
  "learningPlans": [
    {
      "id": "plan-123",
      "title": "Python Fundamentals",
      "focus": "Learn Python basics",
      "status": "in_progress",
      "targetSteps": 10,
      "completedSteps": 3,
      "tasks": [...]
    }
  ],
  "studySessions": [
    {
      "id": "study-session-789",
      "focus": "Python practice",
      "minutes": 45,
      "date": "2025-01-05"
    }
  ],
  "metrics": {
    "weeklyHours": 3.0,
    "totalCompletedSteps": 15,
    "streakDays": 7
  },
  "chatSessions": [
    {
      "id": "session-123",
      "title": "Learning Python",
      "focus": "python basics",
      "updatedAt": "2025-01-05T14:00:00Z"
    }
  ]
}
```

### AI
Purpose: manage AI model configuration and availability.

| Method | Path              | Summary                          | Auth Required |
| ------ | ----------------- | -------------------------------- | ------------- |
| GET    | `/v1/ai/models`   | Get available AI models          | Yes           |

#### GET `/v1/ai/models`
Get list of available AI models from the configured provider.

**Response (200 OK):**
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai"
    },
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "created": 1677649963,
      "owned_by": "openai"
    },
    {
      "id": "gpt-3.5-turbo",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai"
    }
  ]
}
```

## Integrations
- **AI Providers**: Routes dialogue generation through configured model (default GPT-4o) with timeout and fallback support. Uses OpenAI-compatible API format.
- **Authentication**: JWT-based authentication with Bearer token in Authorization header.
- **Database**: PostgreSQL with Prisma ORM for data persistence.

## Common Workflows

### 1. User Registration and Login
```
1. POST /v1/auth/register → Create account → receive access token
2. Store token for subsequent requests
3. Use token in Authorization header: Bearer <token>
```

### 2. Start Learning Session with AI
```
1. POST /v1/dialogue/sessions → Create chat session
2. POST /v1/dialogue/sessions/{id}/messages → Send message
3. Receive AI response
4. Continue conversation
```

### 3. Generate Learning Plan from Dialogue
```
1. POST /v1/dialogue/sessions → Create session
2. POST /v1/dialogue/sessions/{id}/messages → Discuss learning goals
3. POST /v1/plans/generate → Generate plan from session
4. GET /v1/plans → View generated plan with tasks
```

### 4. Track Study Progress
```
1. POST /v1/progress/sessions → Record study session
2. PATCH /v1/plans/{id}/tasks/{taskId} → Mark task as complete
3. GET /v1/progress/stats → View updated statistics
4. GET /v1/progress/trend → View learning trends
```

### 5. Monitor Overall Progress
```
1. GET /v1/learning/summary → Get comprehensive overview
2. View all plans, sessions, and metrics in one response
```
