import { Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  validateUser(authPayload: AuthPayloadDto) {}
}
