# API Reference Plan

## Overview
- Base URL: `https://api.aipartner.example.com`(dev version use `https://localhost`)
- Version: `v1` prefix on every path (example: `/v1/dialogue/messages`).
- Authentication: Bearer token (JWT) in the `Authorization` header.
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
Purpose: user registration, login, and token lifecycle.

| Method | Path               | Summary                        |
| ------ | ------------------ | ------------------------------ |
| POST   | `/v1/auth/register`| Create learner account         |
| POST   | `/v1/auth/login`   | Exchange credentials for tokens|
| POST   | `/v1/auth/refresh` | Refresh access token           |
| POST   | `/v1/auth/logout`  | Invalidate refresh token       |

Request example (`/v1/auth/login`):
```json
{
  "email": "user@example.com",
  "password": "string"
}
```
Response example:
```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "expiresIn": 3600
}
```

### Dialogue
Purpose: manage learner chat sessions and AI-generated responses.

| Method | Path                               | Summary                             |
| ------ | ---------------------------------- | ----------------------------------- |
| GET    | `/v1/dialogue/sessions`            | List chat sessions for current user |
| POST   | `/v1/dialogue/sessions`            | Create new session with metadata    |
| GET    | `/v1/dialogue/sessions/{id}`       | Fetch session detail and summary    |
| GET    | `/v1/dialogue/sessions/{id}/messages`| List messages (paginated)          |
| POST   | `/v1/dialogue/sessions/{id}/messages`| Submit learner message, trigger AI |

Message response payload includes AI tool usage and references:
```json
{
  "id": "msg-123",
  "role": "assistant",
  "content": "string",
  "toolCalls": [
    {
      "type": "retrieval",
      "resourceIds": ["kb-1"]
    }
  ],
  "createdAt": "2025-10-01T12:00:00Z"
}
```

### Planning
Purpose: capture learning goals and auto-generated plans.

| Method | Path                         | Summary                                  |
| ------ | ---------------------------- | ---------------------------------------- |
| GET    | `/v1/plans`                  | List plans with completion status        |
| POST   | `/v1/plans`                  | Create plan from learner goals           |
| PATCH  | `/v1/plans/{id}`             | Update metadata (title, due date)        |
| POST   | `/v1/plans/{id}/tasks`       | Add manual tasks                         |
| PATCH  | `/v1/plans/{id}/tasks/{taskId}` | Update status/progress                 |

### Progress
Purpose: track study time, completed tasks, streaks, and reports.

| Method | Path                                  | Summary                                 |
| ------ | ------------------------------------- | --------------------------------------- |
| GET    | `/v1/progress/daily`                  | Aggregated study minutes by day         |
| GET    | `/v1/progress/tasks`                  | Filter tasks across plans (status, due) |
| POST   | `/v1/progress/reports`                | Generate progress report PDF/JSON       |

### Persona
Purpose: maintain learner preferences and AI personalization features.

| Method | Path                      | Summary                            |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/v1/persona/profile`     | Fetch learner persona summary      |
| PATCH  | `/v1/persona/profile`     | Update explicit preferences        |
| GET    | `/v1/persona/recommendations` | Personalized content suggestions |

### Knowledge
Purpose: handle knowledge base entries and vector retrieval.

| Method | Path                              | Summary                               |
| ------ | --------------------------------- | ------------------------------------- |
| GET    | `/v1/knowledge/resources`         | List knowledge entries                 |
| POST   | `/v1/knowledge/resources`         | Upload new resource metadata           |
| POST   | `/v1/knowledge/resources/{id}/upload` | Generate signed URL for binary upload|
| POST   | `/v1/knowledge/search`            | Semantic search using query embeddings |

## Integrations
- AI Providers: route dialogue generation through configured model (default GPT-4o) with 20s timeout and fallback to backup provider.
- Notifications: optional webhook POST to `/webhooks/events` for plan updates (signed using HMAC).

## Sequence Examples
1. **Login**: client → `/v1/auth/login` → returns tokens → store refresh token.
2. **Send message**: client → `/v1/dialogue/sessions/{id}/messages` with learner message → service enqueues AI job → responds with assistant message once ready.
3. **Update task status**: client PATCH `/v1/plans/{id}/tasks/{taskId}` → returns updated plan summary → progress service updates streak asynchronously.

## Testing Strategy
- Contract tests using Postman/Newman nightly.
- Mock server with Prism for frontend integration.
- Smoke tests executed in CI before deployment.
- Monitoring via OpenTelemetry traces and error budget dashboards.
