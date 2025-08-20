import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from 'prisma/prisma.module';

/**
 * Módulo de Autenticação
 * 
 * Configura e organiza todos os componentes relacionados à autenticação:
 * - Controllers: Endpoints públicos
 * - Services: Lógica de negócio
 * - Estratégias: Autenticação JWT
 * - Módulos: Integrações necessárias
 * 
 * @imports JwtModule - Configuração do módulo JWT
 * @imports PrismaModule - Acesso ao banco de dados
 * @controllers AuthController - Rotas de autenticação
 * @providers AuthService, JwtStrategy - Serviços e estratégias
 */
@Module({
  imports: [
    // Configuração do módulo JWT com opções padrão
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret123', // Chave secreta (com fallback para desenvolvimento)
      signOptions: { expiresIn: '24h' }, // Tokens expiram em 24 horas
    }),
    // Módulo de acesso ao banco de dados via Prisma
    PrismaModule,
  ],
  controllers: [AuthController], // Registra o controller de autenticação
  providers: [
    AuthService,   // Serviço com lógica de autenticação
    JwtStrategy,   // Estratégia de validação JWT
  ],
})
export class AuthModule {}