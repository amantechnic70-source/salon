import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { PaymentsService } from './payments.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Controller('payments')
export class PaymentsController {

    constructor(
        private readonly paymentsService:
            PaymentsService,
    ) { }


    @Post('create-order')
    @UseGuards(JwtAuthGuard)
    createOrder(
        @CurrentUser() user: any,
        @Body() dto: CreateOrderDto,
    ) {
        return this.paymentsService.createOrder(
            user.sub,
            dto,
        );
    }


    @Post('verify-payment')
    @UseGuards(JwtAuthGuard)
    verifyPayment(
        @CurrentUser() user: any,
        @Body() dto: VerifyPaymentDto,
    ) {
        return this.paymentsService.verifyPayment(
            user.sub,
            dto,
        );
    }


    @Get('history')
    @UseGuards(JwtAuthGuard)
    paymentHistory(
        @CurrentUser() user: any,
    ) {
        return this.paymentsService.paymentHistory(
            user.sub,
        );
    }


    @Get(':id')
    @UseGuards(JwtAuthGuard)
    paymentDetails(
        @Param('id') id: string,
    ) {
        return this.paymentsService.paymentDetails(
            id,
        );
    }


    @Post('refund')
    @UseGuards(JwtAuthGuard)
    refundPayment(
        @CurrentUser() user: any,
        @Body() dto: RefundPaymentDto,
    ) {
        return this.paymentsService.refundPayment(
            user,
            dto,
        );
    }

}