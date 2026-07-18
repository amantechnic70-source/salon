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

import { StaffService } from './staff.service';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { GetStaffDto } from './dto/get-staff.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';

@Controller('staff')
export class StaffController {

    constructor(
        private readonly staffService: StaffService,
    ) { }

    // SALON OWNER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateStaffDto,
    ) {
        return this.staffService.create(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetStaffDto,
    ) {
        return this.staffService.getAll(
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
        return this.staffService.getById(
            user.sub,
            id,
        );
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateStaffDto,
    ) {
        return this.staffService.update(
            user.sub,
            id,
            dto,
        );
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteStaff(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.staffService.deleteStaff(
            user.sub,
            id,
        );
    }


    // PUBLIC APIs

    @Get('branch/:branchId')
    getStaffByBranch(
        @Param('branchId') branchId: string,
    ) {
        return this.staffService.getStaffByBranch(
            branchId,
        );
    }

    @Get('search/all')
    searchStaff(
        @Query() query: GetStaffDto,
    ) {
        return this.staffService.searchStaff(
            query,
        );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllStaffByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetStaffDto,
    ) {
        return this.staffService.getAllStaffByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateStaffStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateStaffStatusDto,
    ) {
        return this.staffService.updateStaffStatus(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteStaffByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.staffService.deleteStaffByAdmin(
            user,
            id,
        );
    }

}