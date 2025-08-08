import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Coins } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
      },
    });

    const opCoin = await this.prisma.coins.findUnique({
      where: {
        symbol: "OPCOIN"
      }
    }) as Coins

    if (!opCoin) {
      throw new Error('Moeda OPCOIN não encontrada')
    }

    const BRLCoin = await this.prisma.coins.findUnique({
      where: {
        symbol: "BRL"
      }
    }) as Coins

    if (!BRLCoin) {
      throw new Error('Moeda BRL não encontrada')
    }

    await this.prisma.wallets.create({
      data: {
        userId: user.id,
        coinId: opCoin.id,
        balance: 5000
      }
    })
    
    await this.prisma.wallets.create({
      data: {
        userId: user.id,
        coinId: BRLCoin.id,
        balance: 0
      }
    })
    return this.generateToken(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    const token = this.jwtService.sign({ userId });
    return { access_token: token };
  }
}
