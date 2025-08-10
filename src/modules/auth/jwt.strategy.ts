import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Estratégia JWT para autenticação
 * 
 * Implementa a estratégia de autenticação baseada em JWT (JSON Web Tokens).
 * Responsável por validar tokens JWT em requisições e extrair o payload.
 * 
 * @extends PassportStrategy(Strategy) - Extende a estratégia base do Passport
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrai o token do header Authorization como Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Não ignora a expiração do token (valida a data de expiração)
      ignoreExpiration: false,
      
      // Chave secreta para verificar a assinatura do token
      // Usa a variável de ambiente JWT_SECRET ou fallback para desenvolvimento
      secretOrKey: process.env.JWT_SECRET || 'secret123',
    });
  }

  /**
   * Valida o payload do token JWT
   * 
   * @param payload - Objeto contendo os dados decodificados do token
   * @returns Objeto com dados do usuário a serem injetados na requisição
   * 
   * @example
   * // Para um token com payload { userId: '123' }
   * // Retorna { userId: '123' } que será acessível em req.user
   */
  async validate(payload: { userId: string }) {
    // Retorna um objeto simples com o userId para ser anexado ao request
    return { userId: payload.userId };
  }
}