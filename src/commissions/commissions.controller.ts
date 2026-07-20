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

import { CommissionsService } from './commissions.service';

import { CreateCommissionDto } from './dto/create-commission.dto';
import { GetCommissionsDto } from './dto/get-commissions.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';

@Controller('commissions')
export class CommissionsController {

    constructor(
        private readonly commissionsService:
            CommissionsService,
    ) { }


    // SALON OWNER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateCommissionDto,
    ) {
        return this.commissionsService.create(
            user.sub,
            dto,
        );
    }


    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetCommissionsDto,
    ) {
        return this.commissionsService.getAll(
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
        return this.commissionsService.getById(
            user.sub,
            id,
        );
    }


    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateCommissionDto,
    ) {
        return this.commissionsService.update(
            user.sub,
            id,
            dto,
        );
    }


    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    deleteCommission(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.commissionsService.deleteCommission(
            user.sub,
            id,
        );
    }


    // STAFF APIs

    @Get('staff/:id')
    @UseGuards(JwtAuthGuard)
    getStaffCommission(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.commissionsService.getStaffCommission(
            user.sub,
            id,
        );
    }


    @Get('my-commission')
    @UseGuards(JwtAuthGuard)
    getMyCommission(
        @CurrentUser() user: any,
    ) {
        return this.commissionsService.getMyCommission(
            user.sub,
        );
    }


    @Get('monthly/all')
    @UseGuards(JwtAuthGuard)
    getMonthlyCommission(
        @CurrentUser() user: any,
    ) {
        return this.commissionsService.getMonthlyCommission(
            user.sub,
        );
    }


    // REPORT APIs

    @Get('top-performing-staff')
    @UseGuards(JwtAuthGuard)
    getTopPerformingStaff() {
        return this.commissionsService
            .getTopPerformingStaff();
    }


    @Get('search/all')
    searchCommissions(
        @Query() query: GetCommissionsDto,
    ) {
        return this.commissionsService
            .searchCommissions(
                query,
            );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetCommissionsDto,
    ) {
        return this.commissionsService
            .getAllByAdmin(
                user,
                query,
            );
    }


    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateCommissionStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateCommissionStatusDto,
    ) {
        return this.commissionsService
            .updateCommissionStatus(
                user,
                id,
                dto,
            );
    }


    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteCommissionByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.commissionsService
            .deleteCommissionByAdmin(
                user,
                id,
            );
    }

}