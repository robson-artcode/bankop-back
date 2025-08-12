-- CreateTable
CREATE TABLE "public"."users_profile" (
    "id" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_user_id_key" ON "public"."users_profile"("user_id");

-- CreateIndex
CREATE INDEX "users_profile_user_id_idx" ON "public"."users_profile"("user_id");

-- AddForeignKey
ALTER TABLE "public"."users_profile" ADD CONSTRAINT "users_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
