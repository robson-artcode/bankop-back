import { Module } from '@nestjs/common';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
