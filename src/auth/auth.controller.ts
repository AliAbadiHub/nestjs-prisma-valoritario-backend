import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log('Login attempt for user:', req.user);
    const result = await this.authService.login(req.user);
    console.log('Login result:', result);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    console.log('Logout attempt for user:', req.user);
    const result = await this.authService.logout(req.user.id);
    console.log('Logout result:', result);
    return result;
  }
}
