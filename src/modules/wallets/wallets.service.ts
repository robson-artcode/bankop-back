import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getWallets(userId: string) {
    console.log(userId)
    return await this.prisma.wallets.findMany({
      where: { userId: userId },
      include: {
        coin: true 
      }
    });
  }
}
