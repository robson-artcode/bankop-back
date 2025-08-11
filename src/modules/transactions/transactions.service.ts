import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Serviço responsável pelas operações de transações
 * 
 * Camada de negócio que gerencia:
 * - Consulta de histórico de transações
 * - Relacionamentos complexos entre entidades
 */
@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém todas as transações de um usuário
   * 
   * @param userId ID do usuário autenticado
   * @returns Lista de transações ordenadas por data (mais recente primeiro)
   *          com todos os relacionamentos populados
   * 
   * @example
   * // Retorno inclui:
   * // - Tipo da transação
   * // - Moedas envolvidas
   * // - Usuários participantes (para transferências)
   */
  async getTransactions(userId: string) {
    return this.prisma.transactions.findMany({
      where: { userId }, // Filtra pelo ID do usuário
      orderBy: { createdAt: 'desc' }, // Ordena do mais recente para o mais antigo
      include: {
        // Tipo da transação (ex: DEPOSITO, TRANSFERENCIA)
        type: {
          select: { 
            id: true, 
            type: true, 
            description: true 
          }
        },
        // Moeda de origem (para conversões/transferências)
        fromCoin: {
          select: { 
            id: true, 
            symbol: true, 
            name: true 
          }
        },
        // Moeda de destino (para conversões/transferências)
        toCoin: {
          select: { 
            id: true, 
            symbol: true, 
            name: true 
          }
        },
        // Usuário remetente (para transferências)
        userFrom: {
          select: { 
            id: true, 
            name: true, 
            email: true 
          }
        },
        // Usuário destinatário (para transferências)
        userTo: {
          select: { 
            id: true, 
            name: true, 
            email: true 
          }
        }
      }
    });
  }
}