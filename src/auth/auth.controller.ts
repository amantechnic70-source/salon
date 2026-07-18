import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    register(
        @Body() dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(
        @Body() dto: LoginDto,
    ) {
        return this.authService.login(dto);
    }

    @Post('logout')
    logout(userId : any) {
        return this.authService.logout(userId);
    }

    @Post('refresh-token')
    refreshToken(
        @Body() dto: RefreshTokenDto,
    ) {
        return this.authService.refreshToken(dto);
    }

    @Post('forgot-password')
    forgotPassword(
        @Body() dto: ForgotPasswordDto,
    ) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    resetPassword(
        @Body() dto: ResetPasswordDto,
    ) {
        return this.authService.resetPassword(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    changePassword(
        @Req() req,
        @Body() dto: ChangePasswordDto,
    ) {

        return this.authService.changePassword(

            req.user.sub,

            dto,

        );

    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@Req() req) {
        return this.authService.profile(
            req.user,
        );
    }
}