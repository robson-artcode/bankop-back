import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      let message = 'Falha no cadastro. Por favor, tente novamente.';
      let status = HttpStatus.BAD_REQUEST;

      if (error.message.includes('já está em uso')) {
        message = error.message;
      } else if (error.message.includes('validação')) {
        message = 'Dados inválidos. Verifique os campos e tente novamente.';
      }

      throw new HttpException(message, status);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      let message = 'Falha no login. Verifique suas credenciais.';
      let status = HttpStatus.UNAUTHORIZED;

      if (error.message.includes('Credenciais inválidas')) {
        message = error.message;
      }

      throw new HttpException(message, status);
    }
  }
}