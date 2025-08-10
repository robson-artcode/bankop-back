import { Controller, UseGuards, Get, Post, Patch, Body, HttpException, HttpStatus, Request } from '@nestjs/common';
import { WalletService } from './wallets.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ConvertDto } from './dto/convert.dto';
import { TransferDto } from './dto/transfer.dto';

/**
 * Controller responsável pelas operações de carteiras
 * 
 * Gerencia todas as operações relacionadas a:
 * - Consulta de carteiras do usuário
 * - Conversão entre moedas
 * - Transferências entre usuários
 * 
 * Todas as rotas exigem autenticação JWT válida
 * 
 * @Routes /wallets
 */
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Endpoint para listar carteiras do usuário
   * 
   * @param req Objeto de requisição contendo o userId do JWT
   * @returns Lista de carteiras do usuário com saldos
   * @throws HttpException em caso de falha na consulta
   * 
   * @Route GET /wallets
   * @Protected
   */
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

  /**
   * Endpoint para conversão de moedas
   * 
   * @param req Objeto de requisição com userId do JWT
   * @param dto DTO contendo: opCoins (quantidade) e targetCoin (moeda destino)
   * @returns Resultado da operação de conversão
   * @throws HttpException com mensagens específicas para diferentes erros
   * 
   * @Route PATCH /wallets/convert
   * @Protected
   */
  @UseGuards(JwtAuthGuard)
  @Patch('convert')
  async convert(@Request() req, @Body() dto: ConvertDto) {
    try {
      return await this.walletService.convertOpCoins(req.user.userId, dto);
    } catch (error) {
      let message = 'Falha na conversão. Por favor, verifique os valores e tente novamente.';
      let status = HttpStatus.BAD_REQUEST;

      // Tratamento personalizado para erros conhecidos
      if (error.message.includes('não encontrada')) {
        message = error.message; // Mantém mensagem original do serviço
        status = HttpStatus.NOT_FOUND;
      } else if (error.message.includes('Saldo insuficiente')) {
        message = 'Saldo insuficiente para conversão.';
      }

      throw new HttpException(message, status);
    }
  }

  /**
   * Endpoint para transferência entre usuários
   * 
   * @param req Objeto de requisição com userId do JWT
   * @param dto DTO contendo: email (destinatário), amount (valor) e coin (moeda)
   * @returns Resultado da operação de transferência
   * @throws HttpException com mensagens específicas para diferentes erros
   * 
   * @Route POST /wallets/transfer
   * @Protected
   */
  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  async transfer(@Request() req, @Body() dto: TransferDto) {
    try {
      return await this.walletService.transfer(req.user.userId, dto);
    } catch (error) {
      let message = 'Falha na transferência. Por favor, tente novamente.';
      let status = HttpStatus.BAD_REQUEST;

      // Tratamento personalizado para erros conhecidos
      if (error.message.includes('não encontrad')) {
        message = error.message; // Mantém mensagem original do serviço
        status = HttpStatus.NOT_FOUND;
      } else if (error.message.includes('Saldo insuficiente')) {
        message = 'Saldo insuficiente para realizar a transferência.';
      }

      throw new HttpException(message, status);
    }
  }
}