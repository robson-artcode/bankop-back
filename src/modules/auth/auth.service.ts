import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Serviço de Autenticação
 * 
 * Responsável por toda a lógica de autenticação:
 * - Registro de novos usuários
 * - Login de usuários existentes
 * - Geração de tokens JWT
 * - Criação de carteiras iniciais
 */
@Injectable()
export class AuthService {
  // Saldos iniciais para novos usuários
  private readonly INITIAL_OPCOIN_BALANCE = 5000;
  private readonly INITIAL_BRL_BALANCE = 0;

  constructor(
    private readonly jwtService: JwtService, // Serviço JWT para geração de tokens
    private readonly prisma: PrismaService,  // Serviço de acesso ao banco de dados
  ) {}

  /**
   * Registra um novo usuário no sistema
   * 
   * @param dto DTO com dados de registro (nome, email, senha)
   * @returns Token de acesso e dados do usuário
   * @throws ConflictException se o email já estiver cadastrado
   * @throws InternalServerErrorException em caso de falha no registro
   */
  async register(dto: RegisterDto) {
    // Verifica se usuário já existe
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    try {
      // Hash da senha com bcrypt (10 salt rounds)
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Transação atômica para criação do usuário e carteiras
      return await this.prisma.$transaction(async (prisma) => {
        // Cria usuário no banco de dados
        const user = await prisma.users.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
          },
        });

        // Obtém as moedas padrão do sistema
        const [opCoin, BRLCoin] = await Promise.all([
          prisma.coins.findUnique({ where: { symbol: 'OPCOIN' } }),
          prisma.coins.findUnique({ where: { symbol: 'BRL' } }),
        ]);

        // Verifica se as moedas padrão existem
        if (!opCoin || !BRLCoin) {
          throw new InternalServerErrorException('Moedas padrão não configuradas');
        }

        // Cria carteiras iniciais para o usuário
        await Promise.all([
          prisma.wallets.create({
            data: {
              userId: user.id,
              coinId: opCoin.id,
              balance: this.INITIAL_OPCOIN_BALANCE,
            },
          }),
          prisma.wallets.create({
            data: {
              userId: user.id,
              coinId: BRLCoin.id,
              balance: this.INITIAL_BRL_BALANCE,
            },
          }),
        ]);

        // Retorna token JWT para o novo usuário
        return this.generateToken(user);
      });
    } catch (error) {
      console.log(error)
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Falha ao registrar usuário');
    }
  }

  /**
   * Autentica um usuário existente
   * 
   * @param dto DTO com credenciais de login (email, senha)
   * @returns Token de acesso e dados do usuário
   * @throws UnauthorizedException se as credenciais forem inválidas
   * @throws InternalServerErrorException em caso de falha no login
   */
  async login(dto: LoginDto) {
    try {
      // Busca usuário pelo email
      const user = await this.prisma.users.findUnique({ 
        where: { email: dto.email } 
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Compara a senha fornecida com o hash armazenado
      const passwordValid = await bcrypt.compare(dto.password, user.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Retorna token JWT para o usuário autenticado
      return this.generateToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Falha ao realizar login');
    }
  }

  /**
   * Gera um token JWT para o usuário
   * 
   * @param user Entidade do usuário
   * @returns Objeto com dados do usuário e token de acesso
   * @throws InternalServerErrorException em caso de falha na geração do token
   */
  private generateToken(user: Users) {
    try {
      const payload = { userId: user.id }; // Payload básico do token
      return {
        user: {
          name: user.name,
          email: user.email
        },
        access_token: this.jwtService.sign(payload, {
          expiresIn: '24h' // Token expira em 24 horas
        }),
      };
    } catch (error) {
      throw new InternalServerErrorException('Falha ao gerar token');
    }
  }
}