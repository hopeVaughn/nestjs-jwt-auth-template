import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { AtGuard } from 'src/common/guards/at.guard';
import { RtGuard } from 'src/common/guards';
import { GetCurrentUserId, GetCurrentUser } from 'src/common/decorators';
@Controller('auth')
export class AuthController {

  constructor (private authService: AuthService) { }

  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  signuplocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signuplocal(dto);
  }

  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: string) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
