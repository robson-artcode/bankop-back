import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConvertDto } from './dto/convert.dto';
import { TransferDto } from './dto/transfer.dto';
import { Coins, TransactionTypes } from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly OPCOIN_TO_BRL_RATE = 5;

  constructor(private readonly prisma: PrismaService) {}

  async getWallets(userId: string) {
    return await this.prisma.wallets.findMany({
      where: { userId },
      include: { coin: true }
    });
  }

  async convertOpCoins(userId: string, dto: ConvertDto) {
    return this.prisma.$transaction(async (prisma) => {
      // Busca moedas
      const [opCoin, brlCoin] = await Promise.all([
        this.findCoin('OPCOIN'),
        this.findCoin('BRL')
      ]);

      // Busca wallets
      const [walletOpCoin, walletBrlCoin] = await Promise.all([
        this.findUserWallet(userId, opCoin.id),
        this.findUserWallet(userId, brlCoin.id)
      ]);

      // Valida saldo
      if (Number(walletOpCoin.balance) < dto.opCoins) {
        throw new Error('Saldo insuficiente');
      }

      // Calcula novos valores
      const opCoinsUpdated = Number(walletOpCoin.balance) - dto.opCoins;
      const brlAmount = dto.opCoins / this.OPCOIN_TO_BRL_RATE;
      const brlUpdated = Number(walletBrlCoin.balance) + brlAmount;

      // Atualiza wallets
      await Promise.all([
        prisma.wallets.update({
          where: { id: walletOpCoin.id },
          data: { balance: opCoinsUpdated }
        }),
        prisma.wallets.update({
          where: { id: walletBrlCoin.id },
          data: { balance: brlUpdated }
        })
      ]);

      // Cria transação
      const transaction = await this.createConvertTransaction(
        userId,
        opCoin.id,
        brlCoin.id,
        dto.opCoins,
        brlAmount
      );

      return {
        updatedOpCoinBalance: opCoinsUpdated,
        updatedBRLCoinBalance: brlUpdated,
        newTransaction: [transaction]
      };
    });
  }

  async transfer(userId: string, dto: TransferDto) {
    return this.prisma.$transaction(async (prisma) => {
      const coin = await this.findCoin(dto.amountCoin);
      const userTo = await this.findUserByEmail(dto.email);
      
      const [walletFrom, walletTo] = await Promise.all([
        this.findUserWallet(userId, coin.id),
        this.findUserWallet(userTo.id, coin.id)
      ]);

      // Verifica e-mails iguais
       if (userTo.id === userId) {
        throw new Error('Não é possível transferir para o próprio usuário.');
      }

      // Valida saldo
      if (Number(walletFrom.balance) < dto.amount) {
        throw new Error('Saldo insuficiente');
      }

      // Atualiza saldos
      const newFromBalance = Number(walletFrom.balance) - dto.amount;
      const newToBalance = Number(walletTo.balance) + dto.amount;

      await Promise.all([
        prisma.wallets.update({
          where: { id: walletFrom.id },
          data: { balance: newFromBalance }
        }),
        prisma.wallets.update({
          where: { id: walletTo.id },
          data: { balance: newToBalance }
        })
      ]);

      // Cria transação
      const transaction = await this.createTransferTransaction(
        userId,
        userTo.id,
        coin.id,
        dto.amount
      );

      return {
        newBalance: newFromBalance,
        amount: dto.amount,
        amountCoin: dto.amountCoin,
        newTransaction: [transaction]
      };
    });
  }

  private async findCoin(symbol: string): Promise<Coins> {
    const coin = await this.prisma.coins.findUnique({ where: { symbol } });
    if (!coin) throw new NotFoundException(`Moeda ${symbol} não encontrada`);
    return coin;
  }

  private async findUserWallet(userId: string, coinId: string) {
    const wallet = await this.prisma.wallets.findFirst({
      where: { userId, coinId }
    });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');
    return wallet;
  }

  private async findUserByEmail(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  private async findTransactionType(type: string): Promise<TransactionTypes> {
    const transactionType = await this.prisma.transactionTypes.findFirst({
      where: { type }
    });
    if (!transactionType) throw new NotFoundException('Tipo de transação não encontrado');
    return transactionType;
  }

  private async createConvertTransaction(
    userId: string,
    fromCoinId: string,
    toCoinId: string,
    amountFrom: number,
    amountTo: number
  ) {
    const transactionType = await this.findTransactionType('CONVERT');
    
    return this.prisma.transactions.create({
      data: {
        fromCoinId,
        toCoinId,
        amountFrom,
        amountTo,
        userId,
        userFromId: userId,
        userToId: userId,
        typeId: transactionType.id
      },
      include: {
        type: { select: { id: true, type: true, description: true } },
        fromCoin: { select: { id: true, symbol: true, name: true } },
        toCoin: { select: { id: true, symbol: true, name: true } },
        userFrom: { select: { id: true, name: true, email: true } },
        userTo: { select: { id: true, name: true, email: true } }
      }
    });
  }

  private async createTransferTransaction(
    userId: string,
    userToId: string,
    coinId: string,
    amount: number
  ) {
    const transactionType = await this.findTransactionType('TRANSFER');
    
    return this.prisma.transactions.create({
      data: {
        fromCoinId: coinId,
        toCoinId: coinId,
        amountFrom: amount,
        amountTo: 0,
        userId,
        userFromId: userId,
        userToId: userToId,
        typeId: transactionType.id
      },
      include: {
        type: { select: { id: true, type: true, description: true } },
        fromCoin: { select: { id: true, symbol: true, name: true } },
        toCoin: { select: { id: true, symbol: true, name: true } },
        userFrom: { select: { id: true, name: true, email: true } },
        userTo: { select: { id: true, name: true, email: true } }
      }
    });
  }
}