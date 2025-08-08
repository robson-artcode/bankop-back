import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConvertDto } from './dto/convert.dto';
import { Coins } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getWallets(userId: string) {
    return await this.prisma.wallets.findMany({
      where: { userId: userId },
      include: {
        coin: true 
      }
    });
  }

  async convertOpCoins(userId: string, dto: ConvertDto) {

    const opCoin = await this.prisma.coins.findUnique({
      where: {
        symbol: 'OPCOIN'
      }
    }) as Coins

    if (!opCoin) {
      throw new Error('Moeda OPCOIN não encontrada')
    }

    const BRLCoin = await this.prisma.coins.findUnique({
      where: {
        symbol: "BRL"
      }
    }) as Coins

    if (!BRLCoin) {
      throw new Error('Moeda BRL não encontrada')
    }


    const walletOpCoin = await this.prisma.wallets.findFirst({
      where: {
        userId,
        coinId: opCoin.id
      }
    })

    if (!walletOpCoin) {
      throw new Error('Wallet de OPCOIN não encontrada')
    }

    const walletBRLCoin = await this.prisma.wallets.findFirst({
      where: {
        userId,
        coinId: BRLCoin.id
      }
    })

    if (!walletBRLCoin) {
      throw new Error('Wallet de BRL não encontrada')
    }

    // Using opCoins Balance
    const opCoinsUpdated = Number(walletOpCoin.balance) - dto.opCoins;

    // Increasing BRL
    const INDEX_OPCOIN_BRL = 5;
    const brazilianRealValue = dto.opCoins / INDEX_OPCOIN_BRL;
    const brazilianRealUpdated = Number(walletBRLCoin.balance) + brazilianRealValue

    const updatedOpCoinWallet = await this.prisma.wallets.update({
      where: { 
        id: walletOpCoin.id
      },
      data: {
        balance: opCoinsUpdated
      }
    })

    const updatedBRLCoinWallet = await this.prisma.wallets.update({
      where: { 
        id: walletBRLCoin.id
      },
      data: {
        balance: brazilianRealUpdated
      }
    })

    return {
      updatedOpCoinBalance: updatedOpCoinWallet.balance,
      updatedBRLCoinBalance: updatedBRLCoinWallet.balance
    }
  }

}
