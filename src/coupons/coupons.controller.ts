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

import { CouponsService } from './coupons.service';

import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { UpdateCouponStatusDto } from './dto/update-coupon-status.dto';

@Controller('coupons')
export class CouponsController {

    constructor(
        private readonly couponsService:
            CouponsService,
    ) { }

    // SALON OWNER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateCouponDto,
    ) {
        return this.couponsService.create(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetCouponsDto,
    ) {
        return this.couponsService.getAll(
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
        return this.couponsService.getById(
            user.sub,
            id,
        );
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateCouponDto,
    ) {
        return this.couponsService.update(
            user.sub,
            id,
            dto,
        );
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteCoupon(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.couponsService.deleteCoupon(
            user.sub,
            id,
        );
    }

    @Post('apply')
    applyCoupon(
        @Body() dto: ApplyCouponDto,
    ) {
        return this.couponsService.applyCoupon(
            dto,
        );
    }

    // PUBLIC APIs

    @Get('search/all')
    searchCoupons(
        @Query() query: GetCouponsDto,
    ) {
        return this.couponsService.searchCoupons(
            query,
        );
    }

    @Get('active/all')
    getActiveCoupons() {
        return this.couponsService.getActiveCoupons();
    }

    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetCouponsDto,
    ) {
        return this.couponsService.getAllByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateCouponStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateCouponStatusDto,
    ) {
        return this.couponsService.updateCouponStatus(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteCouponByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.couponsService.deleteCouponByAdmin(
            user,
            id,
        );
    }

}