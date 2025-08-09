import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getTransactions(userId: string) {
    const transactions = await this.prisma.transactions.findMany({
      where: { userId: userId },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        type: {
          select: {
            id: true,
            type: true,
            description: true,
          }
        },
        fromCoin: {
          select: {
            id: true,
            symbol: true,
            name: true
          }
        },
        toCoin: {
          select: {
            id: true,
            symbol: true,
            name: true
          }
        },
        userFrom: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        userTo: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return transactions;
  }
}
