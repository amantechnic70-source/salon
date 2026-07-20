import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { DashboardService } from './dashboard.service';

import { GetDashboardDto } from './dto/get-dashboard.dto';
import { GetRevenueStatsDto } from './dto/get-revenue-stats.dto';
import { GetMonthlyReportDto } from './dto/get-monthly-report.dto';

@Controller('dashboard')
export class DashboardController {

    constructor(
        private readonly dashboardService:
            DashboardService,
    ) { }


    // SALON OWNER APIs

    @Get('overview')
    @UseGuards(JwtAuthGuard)
    getOverview(
        @CurrentUser() user: any,
        @Query() query: GetDashboardDto,
    ) {
        return this.dashboardService.getOverview(
            user.sub,
            query,
        );
    }


    @Get('today')
    @UseGuards(JwtAuthGuard)
    getTodayStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getTodayStats(
            user.sub,
        );
    }


    @Get('revenue')
    @UseGuards(JwtAuthGuard)
    getRevenueStats(
        @CurrentUser() user: any,
        @Query() query: GetRevenueStatsDto,
    ) {
        return this.dashboardService.getRevenueStats(
            user.sub,
            query,
        );
    }


    @Get('customers')
    @UseGuards(JwtAuthGuard)
    getCustomerStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getCustomerStats(
            user.sub,
        );
    }


    @Get('appointments')
    @UseGuards(JwtAuthGuard)
    getAppointmentStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getAppointmentStats(
            user.sub,
        );
    }


    @Get('staff')
    @UseGuards(JwtAuthGuard)
    getStaffStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getStaffStats(
            user.sub,
        );
    }


    @Get('services')
    @UseGuards(JwtAuthGuard)
    getServiceStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getServiceStats(
            user.sub,
        );
    }


    @Get('commissions')
    @UseGuards(JwtAuthGuard)
    getCommissionStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getCommissionStats(
            user.sub,
        );
    }


    @Get('reviews')
    @UseGuards(JwtAuthGuard)
    getReviewStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getReviewStats(
            user.sub,
        );
    }


    @Get('memberships')
    @UseGuards(JwtAuthGuard)
    getMembershipStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getMembershipStats(
            user.sub,
        );
    }


    @Get('branches')
    @UseGuards(JwtAuthGuard)
    getBranchStats(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getBranchStats(
            user.sub,
        );
    }


    @Get('top-staff')
    @UseGuards(JwtAuthGuard)
    getTopPerformingStaff(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getTopPerformingStaff(
            user.sub,
        );
    }


    @Get('top-services')
    @UseGuards(JwtAuthGuard)
    getTopSellingServices(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getTopSellingServices(
            user.sub,
        );
    }


    @Get('monthly-report')
    @UseGuards(JwtAuthGuard)
    getMonthlyReport(
        @CurrentUser() user: any,
        @Query() query: GetMonthlyReportDto,
    ) {
        return this.dashboardService.getMonthlyReport(
            user.sub,
            query,
        );
    }


    // SUPER ADMIN APIs

    @Get('admin/overview')
    @UseGuards(JwtAuthGuard)
    getAdminOverview(
        @CurrentUser() user: any,
    ) {
        return this.dashboardService.getAdminOverview(
            user,
        );
    }

}