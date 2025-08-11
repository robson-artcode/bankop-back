import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConvertDto } from './dto/convert.dto';
import { TransferDto } from './dto/transfer.dto';
import { Coins, TransactionTypes } from '@prisma/client';

/**
 * Serviço responsável pelas operações de carteiras e transações monetárias
 * 
 * Gerencia:
 * - Consulta de carteiras do usuário
 * - Conversão entre moedas (OPCOIN para BRL)
 * - Transferências entre usuários
 * - Criação de registros de transações
 */
@Injectable()
export class WalletService {
  // Taxa fixa de conversão: 5 OPCOINS = 1 BRL
  private readonly OPCOIN_TO_BRL_RATE = 5;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém todas as carteiras de um usuário
   * 
   * @param userId ID do usuário autenticado
   * @returns Lista de carteiras com informações das moedas associadas
   */
  async getWallets(userId: string) {
    return await this.prisma.wallets.findMany({
      where: { userId },
      include: { coin: true } // Inclui detalhes da moeda
    });
  }

  /**
   * Converte OPCOINS para BRL
   * 
   * @param userId ID do usuário autenticado
   * @param dto DTO contendo a quantidade de OPCOINS a converter
   * @returns Objeto com novos saldos e transação gerada
   * @throws NotFoundException se moedas ou carteiras não forem encontradas
   * @throws Error se saldo for insuficiente
   */
  async convertOpCoins(userId: string, dto: ConvertDto) {
    return this.prisma.$transaction(async (prisma) => {
      // Busca moedas OPCOIN e BRL em paralelo
      const [opCoin, brlCoin] = await Promise.all([
        this.findCoin('OPCOIN'),
        this.findCoin('BRL')
      ]);

      // Busca carteiras do usuário em paralelo
      const [walletOpCoin, walletBrlCoin] = await Promise.all([
        this.findUserWallet(userId, opCoin.id),
        this.findUserWallet(userId, brlCoin.id)
      ]);

      // Valida se há saldo suficiente
      if (Number(walletOpCoin.balance) < dto.opCoins) {
        throw new Error('Saldo insuficiente');
      }

      // Calcula novos valores
      const opCoinsUpdated = Number(walletOpCoin.balance) - dto.opCoins;
      const brlAmount = dto.opCoins / this.OPCOIN_TO_BRL_RATE;
      const brlUpdated = Number(walletBrlCoin.balance) + brlAmount;

      // Atualiza ambas as carteiras em paralelo
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

      // Registra a transação
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

  /**
   * Realiza transferência entre usuários
   * 
   * @param userId ID do usuário remetente
   * @param dto DTO contendo email do destinatário, valor e moeda
   * @returns Objeto com novo saldo e transação gerada
   * @throws NotFoundException se moeda, carteira ou usuário não forem encontrados
   * @throws Error se saldo for insuficiente ou tentativa de auto-transferência
   */
  async transfer(userId: string, dto: TransferDto) {
    return this.prisma.$transaction(async (prisma) => {
      const coin = await this.findCoin(dto.amountCoin);
      const userTo = await this.findUserByEmail(dto.email);
      
      // Busca carteiras do remetente e destinatário em paralelo
      const [walletFrom, walletTo] = await Promise.all([
        this.findUserWallet(userId, coin.id),
        this.findUserWallet(userTo.id, coin.id)
      ]);

      // Impede transferência para si mesmo
      if (userTo.id === userId) {
        throw new Error('Não é possível transferir para o próprio usuário.');
      }

      // Valida saldo do remetente
      if (Number(walletFrom.balance) < dto.amount) {
        throw new Error('Saldo insuficiente');
      }

      // Calcula novos saldos
      const newFromBalance = Number(walletFrom.balance) - dto.amount;
      const newToBalance = Number(walletTo.balance) + dto.amount;

      // Atualiza ambas as carteiras em paralelo
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

      // Registra a transação
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

  /* Métodos auxiliares */

  /**
   * Busca moeda pelo símbolo
   * 
   * @param symbol Símbolo da moeda (ex: 'BRL', 'OPCOIN')
   * @returns Entidade da moeda
   * @throws NotFoundException se moeda não for encontrada
   */
  private async findCoin(symbol: string): Promise<Coins> {
    const coin = await this.prisma.coins.findUnique({ where: { symbol } });
    if (!coin) throw new NotFoundException(`Moeda ${symbol} não encontrada`);
    return coin;
  }

  /**
   * Busca carteira de um usuário para uma moeda específica
   * 
   * @param userId ID do usuário
   * @param coinId ID da moeda
   * @returns Entidade da carteira
   * @throws NotFoundException se carteira não for encontrada
   */
  private async findUserWallet(userId: string, coinId: string) {
    const wallet = await this.prisma.wallets.findFirst({
      where: { userId, coinId }
    });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');
    return wallet;
  }

  /**
   * Busca usuário pelo email
   * 
   * @param email Email do usuário
   * @returns Entidade do usuário
   * @throws NotFoundException se usuário não for encontrado
   */
  private async findUserByEmail(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  /**
   * Busca tipo de transação pelo nome
   * 
   * @param type Tipo da transação (ex: 'CONVERT', 'TRANSFER')
   * @returns Entidade do tipo de transação
   * @throws NotFoundException se tipo não for encontrado
   */
  private async findTransactionType(type: string): Promise<TransactionTypes> {
    const transactionType = await this.prisma.transactionTypes.findFirst({
      where: { type }
    });
    if (!transactionType) throw new NotFoundException('Tipo de transação não encontrado');
    return transactionType;
  }

  /**
   * Cria registro de transação de conversão
   * 
   * @param userId ID do usuário
   * @param fromCoinId ID da moeda de origem
   * @param toCoinId ID da moeda de destino
   * @param amountFrom Valor convertido
   * @param amountTo Valor recebido
   * @returns Transação criada com relacionamentos populados
   */
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
        userFromId: userId, // O usuário é origem e destino na conversão
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

  /**
   * Cria registro de transação de transferência
   * 
   * @param userId ID do usuário remetente
   * @param userToId ID do usuário destinatário
   * @param coinId ID da moeda transferida
   * @param amount Valor transferido
   * @returns Transação criada com relacionamentos populados
   */
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
        amountTo: 0, // Não há conversão em transferências
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