import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { RtGuard } from 'src/common/guards';
import { GetCurrentUserId, GetCurrentUser, Public } from 'src/common/decorators';
@Controller('auth')
export class AuthController {

  constructor (private authService: AuthService) { }

  @Public()
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  signuplocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signuplocal(dto);
  }

  @Public()
  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: string) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
