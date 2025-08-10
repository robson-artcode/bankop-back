import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly INITIAL_OPCOIN_BALANCE = 5000;
  private readonly INITIAL_BRL_BALANCE = 0;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    // Verifica se usuário já existe
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      return await this.prisma.$transaction(async (prisma) => {
        // Cria usuário
        const user = await prisma.users.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
          },
        });

        // Obtém moedas
        const [opCoin, BRLCoin] = await Promise.all([
          prisma.coins.findUnique({ where: { symbol: 'OPCOIN' } }),
          prisma.coins.findUnique({ where: { symbol: 'BRL' } }),
        ]);

        if (!opCoin || !BRLCoin) {
          throw new InternalServerErrorException('Moedas padrão não configuradas');
        }

        // Cria wallets iniciais
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

        return this.generateToken(user);
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Falha ao registrar usuário');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.users.findUnique({ 
        where: { email: dto.email } 
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const passwordValid = await bcrypt.compare(dto.password, user.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      return this.generateToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Falha ao realizar login');
    }
  }

  private generateToken(user: Users) {
    try {
      const payload = { userId: user.id };
      return {
        user: {
          name: user.name,
          email: user.email
        },
        access_token: this.jwtService.sign(payload, {
          expiresIn: '24h'
        }),
      };
    } catch (error) {
      throw new InternalServerErrorException('Falha ao gerar token');
    }
  }
}