-- CreateEnum or Domain definitions (none)

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "timezone" TEXT DEFAULT 'UTC',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "focus" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "sessions_user_title_key" ON "Session"("user_id", "title");

CREATE TABLE "Plan" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "session_id" TEXT,
  "title" TEXT NOT NULL,
  "focus" TEXT NOT NULL,
  "due_date" TIMESTAMPTZ,
  "status" TEXT NOT NULL DEFAULT 'in-progress',
  "target_steps" INTEGER NOT NULL DEFAULT 0,
  "completed_steps" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "plans_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_plans_user" ON "Plan"("user_id");
CREATE INDEX "idx_plans_session" ON "Plan"("session_id");

CREATE TABLE "Task" (
  "id" TEXT PRIMARY KEY,
  "plan_id" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'todo',
  "due_date" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "tasks_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_tasks_plan_status" ON "Task"("plan_id", "status");

CREATE TABLE "StudySession" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "session_id" TEXT,
  "focus" TEXT NOT NULL,
  "minutes" INTEGER NOT NULL,
  "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "study_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_study_sessions_user_recorded" ON "StudySession"("user_id", "recorded_at");

CREATE TABLE "ProgressSnapshot" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "streak_days" INTEGER NOT NULL,
  "completed_tasks" INTEGER NOT NULL,
  "study_minutes" INTEGER NOT NULL,
  "captured_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "progress_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_progress_snapshots_user_captured" ON "ProgressSnapshot"("user_id", "captured_at");

-- Trigger to keep updated_at timestamps current
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_session_updated_at
  BEFORE UPDATE ON "Session"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_plan_updated_at
  BEFORE UPDATE ON "Plan"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_task_updated_at
  BEFORE UPDATE ON "Task"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_study_session_updated_at
  BEFORE UPDATE ON "StudySession"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_progress_snapshot_updated_at
  BEFORE UPDATE ON "ProgressSnapshot"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
