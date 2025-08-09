import { Controller, UseGuards, Get, Request } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  getTransactions(@Request() req) {
    return this.transactionService.getTransactions(req.user.userId);
  }
}
