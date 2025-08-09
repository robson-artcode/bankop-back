import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConvertDto } from './dto/convert.dto';
import { Coins } from '@prisma/client';
import { TransferDto } from './dto/transfer.dto';
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
    
    const transactionType = await this.prisma.transactionTypes.findFirst({
      where: {
        type: "CONVERT"
      }
    })

    if (!transactionType) {
      throw new Error('Tipo da transação não encontrada')
    }

    const newTransaction = await this.prisma.transactions.create({
      data: {
        fromCoinId: opCoin.id,
        toCoinId: BRLCoin.id,
        amountFrom: dto.opCoins,
        amountTo: Number(brazilianRealValue),
        userId: userId,
        userFromId: userId,
        userToId: userId,
        typeId: transactionType.id
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
    })

    return {
      updatedOpCoinBalance: updatedOpCoinWallet.balance,
      updatedBRLCoinBalance: updatedBRLCoinWallet.balance,
      newTransaction: [newTransaction]
    }
  }

  async transfer(userId: string, dto: TransferDto) {

    const coinType = await this.prisma.coins.findFirst({
      where: {
        symbol: dto.amountCoin
      }
    })

    if (!coinType) {
      throw new Error('Moeda não encontrada')
    }

    const walletUserFrom = await this.prisma.wallets.findFirst({
      where: {
        userId,
        coinId: coinType.id
      }
    })

    if (!walletUserFrom) {
      throw new Error('Carteira do remetente não encontrada')
    }

    const userTo = await this.prisma.users.findUnique({
      where: {
        email: dto.email
      }
    })

    if (!userTo) {
      throw new Error('Usuário não encontrado')
    }


    const walletUserTo = await this.prisma.wallets.findFirst({
      where: {
        userId: userTo.id,
        coinId: coinType.id
      }
    })

     if (!walletUserTo) {
      throw new Error('Carteira do destinatário não encontrada')
    }
    
    // Calculation
    const newUserFromBalance = Number(walletUserFrom.balance) - dto.amount;
    const newUserToBalance = Number(walletUserTo.balance) + dto.amount;
    
    await this.prisma.wallets.update({
      where: { 
        id: walletUserFrom.id
      },
      data: {
        balance: newUserFromBalance
      }
    })

    await this.prisma.wallets.update({
      where: { 
        id: walletUserTo.id
      },
      data: {
        balance: newUserToBalance
      }
    })

    const transactionType = await this.prisma.transactionTypes.findFirst({
      where: {
        type: "TRANSFER"
      }
    })

    if (!transactionType) {
      throw new Error('Tipo da transação não encontrada')
    }

    await this.prisma.transactions.create({
       data: {
        fromCoinId: coinType.id,
        toCoinId: coinType.id,
        amountFrom: 0,
        amountTo: dto.amount,
        userId: userTo.id,
        userFromId: userId,
        userToId: userTo.id,
        typeId: transactionType.id
      }
    })

    const newTransaction = await this.prisma.transactions.create({
      data: {
        fromCoinId: coinType.id,
        toCoinId: coinType.id,
        amountFrom: dto.amount,
        amountTo: 0,
        userId: userId,
        userFromId: userId,
        userToId: userTo.id,
        typeId: transactionType.id
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
    })

    return {
      newBalance: newUserFromBalance,
      amount: dto.amount,
      amountCoin: dto.amountCoin,
      newTransaction: [newTransaction]
    }
  }
}
