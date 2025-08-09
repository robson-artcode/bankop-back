/*
  Warnings:

  - You are about to alter the column `balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,8)`.
  - Added the required column `type_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_from_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_to_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."transactions_from_coin_id_idx";

-- DropIndex
DROP INDEX "public"."transactions_to_coin_id_idx";

-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "type_id" TEXT NOT NULL,
ADD COLUMN     "user_from_id" TEXT NOT NULL,
ADD COLUMN     "user_to_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."wallets" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,8);

-- CreateTable
CREATE TABLE "public"."transaction_types" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_from_coin_id_to_coin_id_idx" ON "public"."transactions"("from_coin_id", "to_coin_id");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "public"."transactions"("created_at");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."transaction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_from_id_fkey" FOREIGN KEY ("user_from_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_to_id_fkey" FOREIGN KEY ("user_to_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
