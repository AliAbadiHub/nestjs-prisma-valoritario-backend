import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private redisClient: Redis.RedisClientType;

  constructor(private configService: ConfigService) {
    const secret = configService.getOrThrow<string>('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    this.redisClient = Redis.createClient({
      url: 'redis://localhost:6379',
    });
    this.redisClient.connect().catch(console.error);
  }

  async validate(payload: any) {
    const token = await this.redisClient.get(`token:${payload.sub}`);
    if (!token) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
