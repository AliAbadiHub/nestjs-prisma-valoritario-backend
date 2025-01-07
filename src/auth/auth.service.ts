import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as Redis from 'redis';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private redisClient: Redis.RedisClientType;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    this.redisClient = Redis.createClient({
      url: 'redis://localhost:6379',
    });
    this.redisClient.connect().catch(console.error);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    if (user) {
      const userWithPassword = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, password: true, role: true },
      });

      if (
        userWithPassword &&
        userWithPassword.password &&
        (await bcrypt.compare(pass, userWithPassword.password))
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = userWithPassword;
        return result;
      }
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    console.log('Creating token with payload:', payload);
    const token = this.jwtService.sign(payload);
    await this.redisClient.set(`token:${user.id}`, token, {
      EX: 3600, // Token expires in 1 hour
    });
    console.log('Token stored in Redis for user:', user.id);
    return {
      access_token: token,
    };
  }

  async logout(userId: string) {
    await this.redisClient.del(`token:${userId}`);
    return { message: 'Logged out successfully' };
  }
}
