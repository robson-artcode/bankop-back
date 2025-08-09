/*
  Warnings:

  - You are about to drop the `wallet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."wallet" DROP CONSTRAINT "wallet_coin_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."wallet" DROP CONSTRAINT "wallet_user_id_fkey";

-- DropTable
DROP TABLE "public"."wallet";

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "from_coin_id" TEXT NOT NULL,
    "to_coin_id" TEXT NOT NULL,
    "amount_from" DECIMAL(65,30) NOT NULL,
    "amount_to" DECIMAL(65,30) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coin_id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_from_coin_id_idx" ON "public"."transactions"("from_coin_id");

-- CreateIndex
CREATE INDEX "transactions_to_coin_id_idx" ON "public"."transactions"("to_coin_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "public"."transactions"("user_id");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "public"."wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallets_coin_id_idx" ON "public"."wallets"("coin_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_coin_id_key" ON "public"."wallets"("user_id", "coin_id");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_from_coin_id_fkey" FOREIGN KEY ("from_coin_id") REFERENCES "public"."coins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_to_coin_id_fkey" FOREIGN KEY ("to_coin_id") REFERENCES "public"."coins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_coin_id_fkey" FOREIGN KEY ("coin_id") REFERENCES "public"."coins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
