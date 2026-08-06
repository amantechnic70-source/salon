import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { CustomerBookingService } from './customer-booking.service';

import { GetSalonsDto } from './dto/customer/get-salons.dto';
import { GetSalonServicesDto } from './dto/customer/get-salon-services.dto';
import { GetBranchStaffDto } from './dto/customer/get-branch-staff.dto';
import { GetAvailableSlotsDto } from './dto/customer/get-available-slots.dto';
import { GetMyBookingsDto } from './dto/customer/get-my-bookings.dto';
import { CreateBookingDto } from './dto/customer/create-booking.dto';
import { CancelBookingDto } from './dto/customer/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/customer/reschedule-booking.dto';

@Controller('customer-booking')
export class CustomerBookingController {

    constructor(
        private readonly customerBookingService: CustomerBookingService,
    ) { }

    // ==========================
    // Get All Salons
    // ==========================

    @Get('salons')
    getSalons(
        @Query() query: GetSalonsDto,
    ) {
        return this.customerBookingService.getSalons(
            query,
        );
    }

    // ==========================
    // Get Salon Details
    // ==========================

    @Get('salon/:id')
    getSalonDetails(
        @Param('id') salonId: string,
    ) {
        return this.customerBookingService.getSalonDetails(
            salonId,
        );
    }

    // ==========================
    // Get Salon Services
    // ==========================

    @Get('services')
    getSalonServices(
        @Query() query: GetSalonServicesDto,
    ) {
        return this.customerBookingService.getSalonServices(
            query,
        );
    }

    // ==========================
    // Get Branch Staff
    // ==========================

    @Get('staff')
    getBranchStaff(
        @Query() query: GetBranchStaffDto,
    ) {
        return this.customerBookingService.getBranchStaff(
            query.branchId,
        );
    }

    // ==========================
    // Get Available Slots
    // ==========================

    @Get('available-slots')
    getAvailableSlots(
        @Query() query: GetAvailableSlotsDto,
    ) {
        return this.customerBookingService.availableSlots(
            query,
        );
    }

    // ==========================
    // Create Booking
    // ==========================

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createBooking(
        @CurrentUser() user: any,
        @Body() dto: CreateBookingDto,
    ) {
        return this.customerBookingService.createBooking(
            user.sub,
            dto,
        );
    }

    // ==========================
    // My Bookings
    // ==========================

    @Get('my-bookings')
    @UseGuards(JwtAuthGuard)
    myBookings(
        @CurrentUser() user: any,
        @Query() query: GetMyBookingsDto,
    ) {
        return this.customerBookingService.myBookings(
            user.sub,
            query,
        );
    }

    // ==========================
    // Cancel Booking
    // ==========================

    @Patch('cancel')
    @UseGuards(JwtAuthGuard)
    cancelBooking(
        @CurrentUser() user: any,
        @Body() dto: CancelBookingDto,
    ) {
        return this.customerBookingService.cancelBooking(
            user.sub,
            dto,
        );
    }

    // ==========================
    // Reschedule Booking
    // ==========================

    @Patch('reschedule')
    @UseGuards(JwtAuthGuard)
    rescheduleBooking(
        @CurrentUser() user: any,
        @Body() dto: RescheduleBookingDto,
    ) {
        return this.customerBookingService.rescheduleBooking(
            user.sub,
            dto,
        );
    }

}