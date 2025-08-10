import { Controller, UseGuards, Get, Post, Patch, Body, HttpException, HttpStatus, Request } from '@nestjs/common';
import { WalletService } from './wallets.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ConvertDto } from './dto/convert.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWallets(@Request() req) {
    try {
      return await this.walletService.getWallets(req.user.userId);
    } catch (error) {
      throw new HttpException(
        'Falha ao buscar carteiras. Por favor, tente novamente mais tarde.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('convert')
  async convert(@Request() req, @Body() dto: ConvertDto) {
    try {
      return await this.walletService.convertOpCoins(req.user.userId, dto);
    } catch (error) {
      let message = 'Falha na conversão. Por favor, verifique os valores e tente novamente.';
      let status = HttpStatus.BAD_REQUEST;

      if (error.message.includes('não encontrada')) {
        message = error.message;
      } else if (error.message.includes('Saldo insuficiente')) {
        message = 'Saldo insuficiente para conversão.';
      }

      throw new HttpException(message, status);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  async transfer(@Request() req, @Body() dto: TransferDto) {
    try {
      return await this.walletService.transfer(req.user.userId, dto);
    } catch (error) {
      let message = 'Falha na transferência. Por favor, tente novamente.';
      let status = HttpStatus.BAD_REQUEST;

      if (error.message.includes('não encontrad')) {
        message = error.message;
      } else if (error.message.includes('Saldo insuficiente')) {
        message = 'Saldo insuficiente para realizar a transferência.';
      }

      throw new HttpException(message, status);
    }
  }
}