import { Controller, UseGuards, Get, Request, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTransactions(@Request() req) {
    try {
      return await this.transactionService.getTransactions(req.user.userId);
    } catch (error) {
      throw new HttpException(
        'Falha ao buscar transações. Por favor, tente novamente mais tarde.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}