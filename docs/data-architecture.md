# Data Architecture Plan

## Store Overview
- **PostgreSQL**: authoritative store for structured entities (users, plans, tasks, progress metrics).
- **MongoDB**: conversational documents (raw chat transcripts, AI responses, action logs).
- **Vector DB (pgvector/Pinecone)**: embeddings for knowledge resources, persona vectors, dialogue context recall.
- **Object Storage (S3-compatible)**: binary assets (exported reports, user uploads, audio).

## PostgreSQL Schema Sketch
- `users`
  - `id (uuid, pk)`
  - `email (unique)`
  - `password_hash`
  - `display_name`
  - `timezone`
  - `created_at`
- `sessions`
  - `id (uuid)`
  - `user_id (fk users)`
  - `title`
  - `focus`
  - `updated_at`
- `plans`
  - `id (uuid)`
  - `user_id (fk users)`
  - `session_id (fk sessions nullable)`
  - `title`
  - `due_date`
  - `status`
  - `created_at`
- `tasks`
  - `id (uuid)`
  - `plan_id (fk plans)`
  - `summary`
  - `status`
  - `due_date`
  - `completed_at`
- `study_sessions`
  - `id (uuid)`
  - `user_id`
  - `session_id`
  - `minutes`
  - `recorded_at`
- `progress_snapshots`
  - `id (uuid)`
  - `user_id`
  - `streak_days`
  - `completed_tasks`
  - `study_minutes`
  - `captured_at`

Indexes: composite (`user_id`, `recorded_at`) for study sessions; GIN index for tasks status/due date filters.

## MongoDB Collections
- `dialogue_messages`
  - `_id`
  - `sessionId`
  - `userId`
  - `role`
  - `content`
  - `toolCalls`
  - `tokens`
  - `createdAt`
- `persona_snapshots`
  - `_id`
  - `userId`
  - `traits`
  - `preferences`
  - `createdAt`
- `audit_logs`
  - `_id`
  - `userId`
  - `action`
  - `metadata`
  - `createdAt`

Indexes: TTL on `audit_logs` (180 days); compound (`sessionId`, `createdAt`) for dialogue ordering; text index for persona keywords for fallback search.

## Vector Database
- Namespace per tenant.
- Embedding schema:
  - `id`
  - `vector`
  - `metadata` (`resourceId`, `language`, `tags`, `source`)
- Use 1536-dim embeddings (OpenAI text-embedding-3-large) with cosine similarity.
- Upsert triggered when knowledge resource saved; background job keeps persona vectors fresh nightly.

## Object Storage
- Bucket layout:
  - `reports/{userId}/{reportId}.pdf`
  - `uploads/{userId}/{timestamp}-{filename}`
  - `audio/{sessionId}/{messageId}.mp3`
- Objects stored with `private` ACL, pre-signed URLs expire after 10 minutes.
- Lifecycle policies: archive reports after 180 days, delete audio after 90 days.

## Data Flows
1. **Chat Message**: PostgreSQL session record → MongoDB stores message → vector db updated if assistant response flagged for recall.
2. **Plan Generation**: Plan metadata stored in PostgreSQL → tasks inserted → embeddings generated for plan summary → persona snapshot updated.
3. **Progress Update**: Task status change triggers event → progress service writes snapshot → optional notification event to message bus.

## Consistency Strategy
- PostgreSQL is source of truth for plan/task state.
- MongoDB entries reference PostgreSQL IDs; cascading deletes implemented via async workers.
- Vector DB updates performed via outbox table in PostgreSQL to ensure eventual consistency.
- Saga pattern for long-running operations (e.g., knowledge import).

## Retention & Compliance
- PII: email, display name encrypted at rest (PostgreSQL TDE) and redacted in logs.
- Dialogue transcripts retained 365 days; learners can request deletion (soft delete flag cascaded through workers).
- Backups: nightly logical dump for PostgreSQL (14-day retention), MongoDB snapshots every 6 hours (30-day retention).
- Disaster recovery RTO: 4 hours, RPO: 15 minutes.

## Migrations & Tooling
- PostgreSQL: Prisma migrations checked into repo; each migration reviewed.
- MongoDB: migrate via Node scripts with idempotent up/down functions.
- Vector DB: schema handled programmatically; version field ensures compatibility.
- Seeding: dev seeds for demo user, sessions, plans.

## Monitoring & Alerting
- Metrics: DB CPU/IO, query latency (PgBouncer), Mongo replication lag, vector upsert failures.
- Alert thresholds: plan write latency > 200ms (5-min average), replication lag > 1 min, object storage error rate > 2%.
- Logging: structured JSON logs with request id, user id, session id.
- Security: Vault-managed credentials rotated every 90 days; IAM roles scoped per service.

## Capacity Targets
- Users: 50k MAU initial target.
- Expected load: 5 writes/sec to PostgreSQL, 10 reads/sec; Mongo 20 writes/sec peak during chat sessions.
- Storage sizing: PostgreSQL 200 GB with auto-scaling, Mongo 500 GB cluster, vector db 20M embeddings (~30 GB), object storage 2 TB.

## Operational Playbooks
- **Incident Response**: documented on-call runbooks for data loss, replication lag, and credential compromise.
- **Schema Changes**: run migrations in staging, capture rollback scripts, deploy during low-traffic windows.
- **Data Requests**: GDPR export/delete handled via background workers with audit trail.
