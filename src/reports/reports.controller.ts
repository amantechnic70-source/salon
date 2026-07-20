import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { ReportsService } from './reports.service';

import { GetRevenueReportDto } from './dto/get-revenue-report.dto';
import { GetCustomerReportDto } from './dto/get-customer-report.dto';
import { GetStaffReportDto } from './dto/get-staff-report.dto';
import { GetAppointmentReportDto } from './dto/get-appointment-report.dto';
import { GetAttendanceReportDto } from './dto/get-attendance-report.dto';
import { GetMonthlyReportDto } from './dto/get-monthly-report.dto';
import { GetYearlyReportDto } from './dto/get-yearly-report.dto';

@Controller('reports')
export class ReportsController {

    constructor(
        private readonly reportsService:
            ReportsService,
    ) { }


    @Get('revenue')
    @UseGuards(JwtAuthGuard)
    getRevenueReport(
        @CurrentUser() user: any,
        @Query() query: GetRevenueReportDto,
    ) {
        return this.reportsService
            .getRevenueReport(
                user.sub,
                query,
            );
    }


    @Get('customers')
    @UseGuards(JwtAuthGuard)
    getCustomerReport(
        @CurrentUser() user: any,
        @Query() query: GetCustomerReportDto,
    ) {
        return this.reportsService
            .getCustomerReport(
                user.sub,
                query,
            );
    }


    @Get('staff')
    @UseGuards(JwtAuthGuard)
    getStaffReport(
        @CurrentUser() user: any,
        @Query() query: GetStaffReportDto,
    ) {
        return this.reportsService
            .getStaffReport(
                user.sub,
                query,
            );
    }


    @Get('appointments')
    @UseGuards(JwtAuthGuard)
    getAppointmentReport(
        @CurrentUser() user: any,
        @Query() query: GetAppointmentReportDto,
    ) {
        return this.reportsService
            .getAppointmentReport(
                user.sub,
                query,
            );
    }


    @Get('attendance')
    @UseGuards(JwtAuthGuard)
    getAttendanceReport(
        @CurrentUser() user: any,
        @Query() query: GetAttendanceReportDto,
    ) {
        return this.reportsService
            .getAttendanceReport(
                user.sub,
                query,
            );
    }


    @Get('invoices')
    @UseGuards(JwtAuthGuard)
    getInvoiceReport(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getInvoiceReport(
                user.sub,
            );
    }


    @Get('memberships')
    @UseGuards(JwtAuthGuard)
    getMembershipReport(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getMembershipReport(
                user.sub,
            );
    }


    @Get('commissions')
    @UseGuards(JwtAuthGuard)
    getCommissionReport(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getCommissionReport(
                user.sub,
            );
    }


    @Get('services')
    @UseGuards(JwtAuthGuard)
    getServiceReport(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getServiceReport(
                user.sub,
            );
    }


    @Get('branches')
    @UseGuards(JwtAuthGuard)
    getBranchReport(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getBranchReport(
                user.sub,
            );
    }


    @Get('coupons')
    @UseGuards(JwtAuthGuard)
    getCouponReport(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getCouponReport(
                user.sub,
            );
    }


    @Get('reviews')
    @UseGuards(JwtAuthGuard)
    getReviewReport(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getReviewReport(
                user.sub,
            );
    }


    @Get('monthly')
    @UseGuards(JwtAuthGuard)
    getMonthlyReport(
        @CurrentUser() user: any,
        @Query() query: GetMonthlyReportDto,
    ) {
        return this.reportsService
            .getMonthlyReport(
                user.sub,
                query,
            );
    }


    @Get('yearly')
    @UseGuards(JwtAuthGuard)
    getYearlyReport(
        @CurrentUser() user: any,
        @Query() query: GetYearlyReportDto,
    ) {
        return this.reportsService
            .getYearlyReport(
                user.sub,
                query,
            );
    }


    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAdminReports(
        @CurrentUser() user: any,
    ) {
        return this.reportsService
            .getAdminReports(
                user,
            );
    }

}