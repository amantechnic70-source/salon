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

import { AppointmentsService } from './appointments.service';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Controller('appointments')
export class AppointmentsController {

    constructor(
        private readonly appointmentsService:
            AppointmentsService,
    ) { }

    // SALON OWNER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateAppointmentDto,
    ) {
        return this.appointmentsService.create(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetAppointmentsDto,
    ) {
        return this.appointmentsService.getAll(
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
        return this.appointmentsService.getById(
            user.sub,
            id,
        );
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateAppointmentDto,
    ) {
        return this.appointmentsService.update(
            user.sub,
            id,
            dto,
        );
    }

    @Patch('reschedule/:id')
    @UseGuards(JwtAuthGuard)
    rescheduleAppointment(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: RescheduleAppointmentDto,
    ) {
        return this.appointmentsService.rescheduleAppointment(
            user.sub,
            id,
            dto,
        );
    }

    @Patch('status/:id')
    @UseGuards(JwtAuthGuard)
    updateAppointmentStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateAppointmentStatusDto,
    ) {
        return this.appointmentsService.updateAppointmentStatus(
            user.sub,
            id,
            dto,
        );
    }

    @Delete('cancel/:id')
    @UseGuards(JwtAuthGuard)
    cancelAppointment(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: CancelAppointmentDto,
    ) {
        return this.appointmentsService.cancelAppointment(
            user.sub,
            id,
            dto,
        );
    }

    // PUBLIC APIs

    @Get('search/all')
    searchAppointments(
        @Query() query: GetAppointmentsDto,
    ) {
        return this.appointmentsService.searchAppointments(
            query,
        );
    }

    @Get('today/all')
    getTodayAppointments() {
        return this.appointmentsService.getTodayAppointments();
    }

    @Get('upcoming/all')
    getUpcomingAppointments() {
        return this.appointmentsService.getUpcomingAppointments();
    }

    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetAppointmentsDto,
    ) {
        return this.appointmentsService.getAllByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateStatusByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateAppointmentStatusDto,
    ) {
        return this.appointmentsService.updateStatusByAdmin(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.appointmentsService.deleteByAdmin(
            user,
            id,
        );
    }

}