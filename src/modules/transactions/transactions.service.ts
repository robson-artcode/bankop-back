import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactions(userId: string) {
    return this.prisma.transactions.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        type: {
          select: { id: true, type: true, description: true }
        },
        fromCoin: {
          select: { id: true, symbol: true, name: true }
        },
        toCoin: {
          select: { id: true, symbol: true, name: true }
        },
        userFrom: {
          select: { id: true, name: true, email: true }
        },
        userTo: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }
}