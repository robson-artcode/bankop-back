import { Module } from '@nestjs/common';
import { WalletController } from './wallets.controller';
import { WalletService } from './wallets.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
