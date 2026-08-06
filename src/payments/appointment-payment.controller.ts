import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { AppointmentPaymentService } from './appointment-payment.service';

import { CreateAppointmentOrderDto } from './dto/appointment/create-appointment-order.dto';
import { VerifyAppointmentPaymentDto } from './dto/appointment/verify-appointment-payment.dto';
import { GetAppointmentPaymentsDto } from './dto/appointment/get-appointment-payments.dto';

@Controller('appointment-payment')
export class AppointmentPaymentController {

    constructor(
        private readonly appointmentPaymentService:
            AppointmentPaymentService,
    ) { }

    @Post('create-order')
    @UseGuards(JwtAuthGuard)
    createOrder(
        @CurrentUser() user: any,
        @Body() dto: CreateAppointmentOrderDto,
    ) {
        return this.appointmentPaymentService.createAppointmentOrder(
            user.sub,
            dto,
        );
    }

    @Post('verify-payment')
    @UseGuards(JwtAuthGuard)
    verifyPayment(
        @CurrentUser() user: any,
        @Body() dto: VerifyAppointmentPaymentDto,
    ) {
        return this.appointmentPaymentService.verifyAppointmentPayment(
            user.sub,
            dto,
        );
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    paymentHistory(
        @CurrentUser() user: any,
        @Query() query: GetAppointmentPaymentsDto,
    ) {
        return this.appointmentPaymentService.appointmentPaymentHistory(
            user.sub,
            query,
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    paymentDetails(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.appointmentPaymentService.appointmentPaymentDetails(
            user.sub,
            id,
        );
    }

}