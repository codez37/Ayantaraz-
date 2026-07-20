-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'consultant', 'content_manager', 'admin');

-- CreateEnum
CREATE TYPE "OTPStatus" AS ENUM ('active', 'expired', 'used', 'blocked');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('article', 'video', 'minibook', 'static_page', 'faq');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ContentVisibility" AS ENUM ('public', 'authenticated', 'course_only', 'admin_only');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('accounting', 'tax', 'general');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('pending', 'contacted', 'scheduled', 'completed', 'canceled', 'no_response', 'rejected');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'waiting_for_call', 'waiting_for_payment', 'confirmed', 'rejected', 'canceled', 'refunded', 'expired');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('course', 'consultation');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'forbidden');

-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('open', 'assigned', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "TaxBook" AS ENUM ('DIRECT', 'INDIRECT');

-- CreateEnum
CREATE TYPE "TaxCategory" AS ENUM ('INHERITANCE', 'PROPERTY_INCOME', 'SALARY', 'BUSINESS', 'CORPORATE', 'INCIDENTAL_INCOME', 'EXEMPTION', 'TRANSFER', 'PENALTIES', 'TAX_AUTHORITIES', 'STAMP_DUTY');

-- CreateEnum
CREATE TYPE "BracketType" AS ENUM ('SALARY', 'RENTAL', 'INHERITANCE', 'BUSINESS', 'CORPORATE', 'TRANSFER', 'VAT', 'PROPERTY', 'INCIDENTAL', 'PENALTY');

-- CreateEnum
CREATE TYPE "RuleActionType" AS ENUM ('EXEMPT', 'PERCENTAGE_RATE', 'FIXED_RATE', 'DISCOUNT', 'MULTIPLIER', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "TaxSessionStep" AS ENUM ('awaiting_query', 'searching', 'computing', 'processing', 'results_displayed', 'terminated');

-- CreateEnum
CREATE TYPE "QueryType" AS ENUM ('SEARCH', 'CALC', 'PROCEDURE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "first_name" TEXT NOT NULL DEFAULT '',
    "last_name" TEXT NOT NULL DEFAULT '',
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" "OTPStatus" NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" SERIAL NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "meta_description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "media_url" TEXT NOT NULL DEFAULT '',
    "thumbnail_url" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "page_count" INTEGER NOT NULL DEFAULT 0,
    "author_id" INTEGER,
    "reviewed_by" INTEGER,
    "category_id" INTEGER,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'public',
    "published_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL DEFAULT 0,
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "author_id" INTEGER,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_videos" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" "ConsultationType" NOT NULL,
    "description" TEXT NOT NULL,
    "first_name" TEXT NOT NULL DEFAULT '',
    "last_name" TEXT NOT NULL DEFAULT '',
    "phone_number" TEXT NOT NULL DEFAULT '',
    "preferred_time" TEXT NOT NULL DEFAULT '',
    "status" "ConsultationStatus" NOT NULL DEFAULT 'pending',
    "assigned_to_id" INTEGER,
    "internal_notes" TEXT NOT NULL DEFAULT '',
    "contacted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_type" "OrderItemType" NOT NULL,
    "item_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "payment_reference" TEXT NOT NULL DEFAULT '',
    "internal_notes" TEXT NOT NULL DEFAULT '',
    "first_name" TEXT NOT NULL DEFAULT '',
    "last_name" TEXT NOT NULL DEFAULT '',
    "phone_number" TEXT NOT NULL DEFAULT '',
    "assigned_to_id" INTEGER,
    "verified_by_id" INTEGER,
    "verified_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'low',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER,
    "session_id" TEXT NOT NULL,
    "userId" INTEGER,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "userId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_tickets" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "userId" INTEGER,
    "reason" TEXT NOT NULL,
    "status" "EscalationStatus" NOT NULL DEFAULT 'open',
    "assigned_to_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "escalation_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_id" TEXT,
    "device_info" TEXT,
    "ip_address" TEXT,
    "last_active_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "actor_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role" "UserRole" NOT NULL,
    "permission_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_articles" (
    "id" SERIAL NOT NULL,
    "article_number" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "notes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chapter_title" TEXT NOT NULL DEFAULT '',
    "book" "TaxBook" NOT NULL DEFAULT 'DIRECT',
    "category" "TaxCategory",
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "snapshot_id" TEXT NOT NULL,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" SERIAL NOT NULL,
    "type" "BracketType" NOT NULL,
    "rule_key" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "condition" JSONB NOT NULL,
    "action" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_brackets" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "BracketType" NOT NULL,
    "bracket_order" INTEGER NOT NULL,
    "min_amount" BIGINT NOT NULL,
    "max_amount" BIGINT,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_sessions" (
    "id" TEXT NOT NULL,
    "step" "TaxSessionStep" NOT NULL DEFAULT 'awaiting_query',
    "query_type" TEXT,
    "original_query" TEXT,
    "detected_type" TEXT,
    "calc_type" TEXT,
    "calc_params" JSONB,
    "calc_result" JSONB,
    "search_results" JSONB,
    "selected_article_id" INTEGER,
    "procedure_topic" TEXT,
    "history" JSONB NOT NULL DEFAULT '[]',
    "user_id" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 0,
    "message_hash" TEXT,
    "trace_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "otps_phone_status_idx" ON "otps"("phone", "status");

-- CreateIndex
CREATE INDEX "otps_created_at_idx" ON "otps"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "contents_slug_key" ON "contents"("slug");

-- CreateIndex
CREATE INDEX "contents_content_type_status_visibility_idx" ON "contents"("content_type", "status", "visibility");

-- CreateIndex
CREATE INDEX "contents_slug_idx" ON "contents"("slug");

-- CreateIndex
CREATE INDEX "contents_tags_idx" ON "contents"("tags");

-- CreateIndex
CREATE INDEX "contents_author_id_idx" ON "contents"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "courses_author_id_idx" ON "courses"("author_id");

-- CreateIndex
CREATE INDEX "course_videos_course_id_status_idx" ON "course_videos"("course_id", "status");

-- CreateIndex
CREATE INDEX "enrollments_order_id_idx" ON "enrollments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "consultation_requests_user_id_status_idx" ON "consultation_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "consultation_requests_status_idx" ON "consultation_requests"("status");

-- CreateIndex
CREATE INDEX "consultation_requests_assigned_to_id_idx" ON "consultation_requests"("assigned_to_id");

-- CreateIndex
CREATE INDEX "consultation_requests_phone_number_idx" ON "consultation_requests"("phone_number");

-- CreateIndex
CREATE INDEX "orders_user_id_status_idx" ON "orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_assigned_to_id_idx" ON "orders"("assigned_to_id");

-- CreateIndex
CREATE INDEX "orders_phone_number_idx" ON "orders"("phone_number");

-- CreateIndex
CREATE INDEX "knowledge_base_isActive_riskLevel_idx" ON "knowledge_base"("isActive", "riskLevel");

-- CreateIndex
CREATE INDEX "knowledge_base_category_idx" ON "knowledge_base"("category");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages"("session_id");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_idx" ON "chat_messages"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_session_id_key" ON "chat_conversations"("session_id");

-- CreateIndex
CREATE INDEX "chat_conversations_userId_idx" ON "chat_conversations"("userId");

-- CreateIndex
CREATE INDEX "escalation_tickets_status_idx" ON "escalation_tickets"("status");

-- CreateIndex
CREATE INDEX "escalation_tickets_conversation_id_idx" ON "escalation_tickets"("conversation_id");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_token_id_idx" ON "sessions"("token_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_updated_by_idx" ON "system_settings"("updated_by");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_permission_key_key" ON "role_permissions"("role", "permission_key");

-- CreateIndex
CREATE INDEX "tax_articles_article_number_idx" ON "tax_articles"("article_number");

-- CreateIndex
CREATE INDEX "tax_articles_book_category_idx" ON "tax_articles"("book", "category");

-- CreateIndex
CREATE INDEX "tax_articles_valid_from_valid_to_idx" ON "tax_articles"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "tax_articles_article_number_valid_from_valid_to_idx" ON "tax_articles"("article_number", "valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "tax_articles_snapshot_id_is_latest_idx" ON "tax_articles"("snapshot_id", "is_latest");

-- CreateIndex
CREATE UNIQUE INDEX "tax_articles_article_number_valid_from_key" ON "tax_articles"("article_number", "valid_from");

-- CreateIndex
CREATE INDEX "tax_rules_type_is_active_effective_from_effective_to_idx" ON "tax_rules"("type", "is_active", "effective_from", "effective_to");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rules_rule_key_key" ON "tax_rules"("rule_key");

-- CreateIndex
CREATE INDEX "tax_brackets_year_type_idx" ON "tax_brackets"("year", "type");

-- CreateIndex
CREATE UNIQUE INDEX "tax_brackets_year_type_bracket_order_key" ON "tax_brackets"("year", "type", "bracket_order");

-- CreateIndex
CREATE INDEX "tax_sessions_expires_at_idx" ON "tax_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "tax_sessions_user_id_idx" ON "tax_sessions"("user_id");

-- CreateIndex
CREATE INDEX "tax_sessions_message_hash_idx" ON "tax_sessions"("message_hash");

-- CreateIndex
CREATE INDEX "tax_sessions_selected_article_id_idx" ON "tax_sessions"("selected_article_id");

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_tickets" ADD CONSTRAINT "escalation_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_tickets" ADD CONSTRAINT "escalation_tickets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_sessions" ADD CONSTRAINT "tax_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

