import { Controller, UseGuards, Get, Request, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

/**
 * Controller responsável pelas operações relacionadas a transações
 * 
 * Todas as rotas deste controller requerem autenticação JWT válida
 * 
 * @Routes /transactions
 */
@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  /**
   * Endpoint para listar transações do usuário autenticado
   * 
   * @param req Objeto de requisição contendo informações do usuário (via JWT)
   * @returns Lista de transações do usuário
   * @throws HttpException em caso de falha na busca
   * 
   * @Route GET /transactions
   * @Protected (requer autenticação JWT)
   */
  @UseGuards(JwtAuthGuard) // Protege a rota com autenticação JWT
  @Get()
  async getTransactions(@Request() req) {
    try {
      // Obtém transações usando o userId do token JWT
      return await this.transactionService.getTransactions(req.user.userId);
    } catch (error) {
      // Tratamento padronizado de erros
      throw new HttpException(
        'Falha ao buscar transações. Por favor, tente novamente mais tarde.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}