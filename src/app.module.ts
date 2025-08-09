import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallets/wallets.module';
import { TransactionModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WalletModule,
    TransactionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}