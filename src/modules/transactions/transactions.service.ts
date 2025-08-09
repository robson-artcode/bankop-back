import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getTransactions(userId: string) {
    return await this.prisma.transactions.findMany({
      where: { userId: userId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
