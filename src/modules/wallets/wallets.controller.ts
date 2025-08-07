import { Controller, UseGuards, Get, Request } from '@nestjs/common';
import { WalletService } from './wallets.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  getWallets(@Request() req) {
    return this.walletService.getWallets(req.user.userId);
  }
}
