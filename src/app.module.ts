import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallets/wallets.module';
import { TransactionModule } from './modules/transactions/transactions.module';
import { UserModule } from './modules/users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WalletModule,
    TransactionModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}