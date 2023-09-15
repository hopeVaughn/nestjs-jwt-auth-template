import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor (private prisma: PrismaService,
    private jwtService: JwtService
  ) { }


  async signuplocal(dto: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash
      }
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);
    return tokens;
  }

  logout() { }

  refreshTokens() { }

  async updateRtHash(userId: string, rt: string) {
    const hash = await this.hashData(rt);
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        hashedRt: hash
      }
    })
  }


  // Utility Functions
  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        }, {
        expiresIn: 60 * 15,
        secret: 'at-secret'
      }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        }, {
        secret: 'rt-secret',
        expiresIn: 60 * 60 * 24 * 7,
      }
      ),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    }
  }


}
