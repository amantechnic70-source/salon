import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { AdminService } from './admin.service';

import { SendAdminOtpDto } from './dto/send-admin-otp.dto';
import { VerifyAdminOtpDto } from './dto/verify-admin-otp.dto';
import { AdminSignupDto } from './dto/admin-signup.dto';
import { GetAdminDashboardDto } from './dto/get-admin-dashboard.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';

@Controller('admin')
export class AdminController {

    constructor(
        private readonly adminService:
            AdminService,
    ) { }


    // INITIALIZE SUPER ADMIN

    @Post('send-otp')
    sendOtp(
        @Body() dto: SendAdminOtpDto,
    ) {
        return this.adminService.sendOtp(
            dto,
        );
    }


    @Post('verify-otp')
    verifyOtp(
        @Body() dto: VerifyAdminOtpDto,
    ) {
        return this.adminService.verifyOtp(
            dto,
        );
    }


    @Post('signup')
    signup(
        @Body() dto: AdminSignupDto,
    ) {
        return this.adminService.signup(
            dto,
        );
    }


    // DASHBOARD

    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    getDashboard(
        @CurrentUser() user: any,
        @Query() query:
            GetAdminDashboardDto,
    ) {
        return this.adminService.getDashboard(
            user,
            query,
        );
    }


    // ANALYTICS

    @Get('analytics')
    @UseGuards(JwtAuthGuard)
    getAnalytics(
        @CurrentUser() user: any,
    ) {
        return this.adminService.getAnalytics(
            user,
        );
    }


    @Get('reports')
    @UseGuards(JwtAuthGuard)
    getReports(
        @CurrentUser() user: any,
    ) {
        return this.adminService.getReports(
            user,
        );
    }


    // PLATFORM SETTINGS

    @Get('platform-settings')
    @UseGuards(JwtAuthGuard)
    getPlatformSettings(
        @CurrentUser() user: any,
    ) {
        return this.adminService
            .getPlatformSettings(
                user,
            );
    }


    @Patch('platform-settings')
    @UseGuards(JwtAuthGuard)
    updatePlatformSettings(
        @CurrentUser() user: any,
        @Body()
        dto: UpdatePlatformSettingsDto,
    ) {
        return this.adminService
            .updatePlatformSettings(
                user,
                dto,
            );
    }


    // SALON MANAGEMENT

    @Get('salons')
    @UseGuards(JwtAuthGuard)
    getSalons(
        @CurrentUser() user: any,
    ) {
        return this.adminService
            .getSalons(
                user,
            );
    }


    @Patch('salon-status/:id')
    @UseGuards(JwtAuthGuard)
    updateSalonStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.adminService
            .updateSalonStatus(
                user,
                id,
            );
    }


    @Delete('delete-salon/:id')
    @UseGuards(JwtAuthGuard)
    deleteSalon(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.adminService
            .deleteSalon(
                user,
                id,
            );
    }

}