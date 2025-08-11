// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Coins
  await prisma.coins.createMany({
    data: [
      {
        id: '63101646-9632-4f68-8707-50fb8cfeb8a7',
        symbol: 'BRL',
        name: 'Real Brasileiro',
        createdAt: new Date('2025-08-07T17:37:52.490Z'),
        updatedAt: new Date('2025-08-07T17:37:52.490Z'),
      },
      {
        id: 'f3bccad7-7b14-4ba6-a4e7-d9aeb7c62fa9',
        symbol: 'OPCOIN',
        name: 'Op Coin',
        createdAt: new Date('2025-08-07T17:37:52.490Z'),
        updatedAt: new Date('2025-08-07T17:37:52.490Z'),
      },
    ],
    skipDuplicates: true,
  });

  // Transaction Types
  await prisma.transactionTypes.createMany({
    data: [
      {
        id: '4e2e1b6a-927a-484c-b7b8-f85c058f4395',
        type: 'CONVERT',
        description: 'Conversão',
        createdAt: new Date('2025-08-09T01:00:37.962Z'),
        updatedAt: new Date('2025-08-09T01:00:37.962Z'),
      },
      {
        id: '68d776f4-911b-4950-b0fa-e560316a7e2f',
        type: 'TRANSFER',
        description: 'Transferência',
        createdAt: new Date('2025-08-09T01:00:37.962Z'),
        updatedAt: new Date('2025-08-09T01:00:37.962Z'),
      },
    ],
    skipDuplicates: true,
  });

  // Users
  await prisma.users.createMany({
    data: [
      {
        id: 'ebf9386f-8f06-4d24-b1a1-1229adce7ef8',
        email: 'testebankop1@gmail.com',
        password: '$2b$10$Oh.thhZTLqdlhF6Iclf1yuxLnR3Wee8FJ/sRDWWGlxIRrI7BKuRoS',
        name: 'Teste BankOp 1',
        createdAt: new Date('2025-08-11T19:08:08.795Z'),
        updatedAt: new Date('2025-08-11T19:08:08.795Z'),
      },
      {
        id: '94db3ef6-56b2-444c-add2-c2c84bac8da7',
        email: 'testebankop2@gmail.com',
        password: '$2b$10$H1BMcvC00V/m9LDDMFs8Z.HOnrLT9aDLEKjHjrIkmTtji7GZnRoti',
        name: 'Teste BankOp 2',
        createdAt: new Date('2025-08-11T19:08:34.230Z'),
        updatedAt: new Date('2025-08-11T19:08:34.230Z'),
      },
    ],
    skipDuplicates: true,
  });

  // Wallets
  await prisma.wallets.createMany({
    data: [
      {
        id: 'da1e64c8-a8b9-4581-bbb3-404edc81040a',
        userId: 'ebf9386f-8f06-4d24-b1a1-1229adce7ef8',
        coinId: 'f3bccad7-7b14-4ba6-a4e7-d9aeb7c62fa9',
        balance: new Prisma.Decimal(5000.0),
        createdAt: new Date('2025-08-11T19:08:08.807Z'),
        updatedAt: new Date('2025-08-11T19:08:08.807Z'),
      },
      {
        id: 'cb5e77ba-f868-4857-be41-205b50eeff56',
        userId: 'ebf9386f-8f06-4d24-b1a1-1229adce7ef8',
        coinId: '63101646-9632-4f68-8707-50fb8cfeb8a7',
        balance: new Prisma.Decimal(0),
        createdAt: new Date('2025-08-11T19:08:08.807Z'),
        updatedAt: new Date('2025-08-11T19:08:08.807Z'),
      },
      {
        id: '74427c19-1d18-4e16-90a9-5cf247af4e2c',
        userId: '94db3ef6-56b2-444c-add2-c2c84bac8da7',
        coinId: 'f3bccad7-7b14-4ba6-a4e7-d9aeb7c62fa9',
        balance: new Prisma.Decimal(5000.0),
        createdAt: new Date('2025-08-11T19:08:34.235Z'),
        updatedAt: new Date('2025-08-11T19:08:34.235Z'),
      },
      {
        id: '3d5fffc7-e520-423a-9092-eebde01e6dd9',
        userId: '94db3ef6-56b2-444c-add2-c2c84bac8da7',
        coinId: '63101646-9632-4f68-8707-50fb8cfeb8a7',
        balance: new Prisma.Decimal(0),
        createdAt: new Date('2025-08-11T19:08:34.235Z'),
        updatedAt: new Date('2025-08-11T19:08:34.235Z'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
