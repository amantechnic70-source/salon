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

import { BranchesService } from './branches.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { GetBranchesDto } from './dto/get-branches.dto';
import { UpdateBranchStatusDto } from './dto/update-branch-status.dto';

@Controller('branches')
export class BranchesController {

    constructor(
        private readonly branchesService: BranchesService,
    ) { }

    // SALON OWNER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateBranchDto,
    ) {
        return this.branchesService.create(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetBranchesDto,
    ) {
        return this.branchesService.getAll(
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
        return this.branchesService.getById(
            user.sub,
            id,
        );
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateBranchDto,
    ) {
        return this.branchesService.update(
            user.sub,
            id,
            dto,
        );
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteBranch(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.branchesService.deleteBranch(
            user.sub,
            id,
        );
    }

    // PUBLIC APIs

    @Get('search/all')
    searchBranches(
        @Query() query: GetBranchesDto,
    ) {
        return this.branchesService.searchBranches(
            query,
        );
    }

    @Get('city/:city')
    getBranchesByCity(
        @Param('city') city: string,
    ) {
        return this.branchesService.getBranchesByCity(
            city,
        );
    }

    @Get('salon/:salonId')
    getBranchesBySalon(
        @Param('salonId') salonId: string,
    ) {
        return this.branchesService.getBranchesBySalon(
            salonId,
        );
    }

    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllBranchesByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetBranchesDto,
    ) {
        return this.branchesService.getAllBranchesByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateBranchStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateBranchStatusDto,
    ) {
        return this.branchesService.updateBranchStatus(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteBranchByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.branchesService.deleteBranchByAdmin(
            user,
            id,
        );
    }

}