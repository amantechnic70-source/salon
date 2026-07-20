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
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';

@Controller('attendance')
export class AttendanceController {

    constructor(
        private readonly attendanceService:
            AttendanceService,
    ) { }


    // STAFF APIs

    @Post('check-in')
    @UseGuards(JwtAuthGuard)
    checkIn(
        @CurrentUser() user: any,
        @Body() dto: CheckInDto,
    ) {
        return this.attendanceService.checkIn(
            user.sub,
            dto,
        );
    }


    @Post('check-out')
    @UseGuards(JwtAuthGuard)
    checkOut(
        @CurrentUser() user: any,
        @Body() dto: CheckOutDto,
    ) {
        return this.attendanceService.checkOut(
            user.sub,
            dto,
        );
    }


    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetAttendanceDto,
    ) {
        return this.attendanceService.getAll(
            user.sub,
            query,
        );
    }


    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getById(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.attendanceService.getById(
            user.sub,
            id,
        );
    }


    // SALON OWNER APIs

    @Get('staff/:id')
    @UseGuards(JwtAuthGuard)
    getStaffAttendance(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.attendanceService.getStaffAttendance(
            user.sub,
            id,
        );
    }


    @Get('branch/:id')
    @UseGuards(JwtAuthGuard)
    getBranchAttendance(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.attendanceService.getBranchAttendance(
            user.sub,
            id,
        );
    }


    @Get('today/all')
    @UseGuards(JwtAuthGuard)
    getTodayAttendance(
        @CurrentUser() user: any,
    ) {
        return this.attendanceService.getTodayAttendance(
            user.sub,
        );
    }


    @Get('search/all')
    searchAttendance(
        @Query() query: GetAttendanceDto,
    ) {
        return this.attendanceService.searchAttendance(
            query,
        );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetAttendanceDto,
    ) {
        return this.attendanceService.getAllByAdmin(
            user,
            query,
        );
    }


    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateAttendanceStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateAttendanceStatusDto,
    ) {
        return this.attendanceService
            .updateAttendanceStatus(
                user,
                id,
                dto,
            );
    }


    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteAttendanceByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.attendanceService
            .deleteAttendanceByAdmin(
                user,
                id,
            );
    }

}