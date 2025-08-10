import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Controlador responsável pelas rotas de autenticação
 * 
 * Gerencia os endpoints de registro e login de usuários,
 * delegando a lógica de negócio para o AuthService.
 * 
 * @Routes /auth
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint para registro de novos usuários
   * 
   * @param dto DTO contendo os dados de registro (RegisterDto)
   * @returns Dados do usuário criado e token de acesso
   * @throws HttpException em caso de falha no cadastro
   * 
   * @Route POST /auth/register
   * @Public
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      let message = 'Falha no cadastro. Por favor, tente novamente.';
      let status = HttpStatus.BAD_REQUEST;

      // Tratamento específico para erros conhecidos
      if (error.message.includes('já está em uso')) {
        message = error.message; // Mantém a mensagem original de conflito
      } else if (error.message.includes('validação')) {
        message = 'Dados inválidos. Verifique os campos e tente novamente.';
      }

      throw new HttpException(message, status);
    }
  }

  /**
   * Endpoint para autenticação de usuários
   * 
   * @param dto DTO contendo credenciais de login (LoginDto)
   * @returns Token de acesso e dados do usuário autenticado
   * @throws HttpException em caso de credenciais inválidas
   * 
   * @Route POST /auth/login
   * @Public
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      let message = 'Falha no login. Verifique suas credenciais.';
      let status = HttpStatus.UNAUTHORIZED;

      // Mantém mensagem específica para credenciais inválidas
      if (error.message.includes('Credenciais inválidas')) {
        message = error.message;
      }

      throw new HttpException(message, status);
    }
  }
}