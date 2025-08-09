import { Controller, UseGuards, Get, Post, Patch, Request, Body } from '@nestjs/common';
import { WalletService } from './wallets.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ConvertDto } from './dto/convert.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  getWallets(@Request() req) {
    return this.walletService.getWallets(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("convert")
  convert(@Request() req, @Body() dto: ConvertDto) {
    return this.walletService.convertOpCoins(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("transfer")
  transfer(@Request() req, @Body() dto: TransferDto) {
    return this.walletService.transfer(req.user.userId, dto);
  }
}
