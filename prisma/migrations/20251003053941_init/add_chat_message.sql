-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_chat_messages_session_created" ON "ChatMessage"("session_id", "created_at");

-- AddForeignKey
ALTER TABLE "ChatMessage" 
DROP CONSTRAINT IF EXISTS "ChatMessage_session_id_fkey",
ADD CONSTRAINT "ChatMessage_session_id_fkey" 
FOREIGN KEY ("session_id") REFERENCES "Session"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" 
DROP CONSTRAINT IF EXISTS "ChatMessage_user_id_fkey",
ADD CONSTRAINT "ChatMessage_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
