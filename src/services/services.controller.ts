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

import { ServicesService } from './services.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServicesDto } from './dto/get-services.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';

@Controller('services')
export class ServicesController {

    constructor(
        private readonly servicesService: ServicesService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateServiceDto,
    ) {
        return this.servicesService.create(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetServicesDto,
    ) {
        return this.servicesService.getAll(
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
        return this.servicesService.getById(
            user.sub,
            id,
        );
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateServiceDto,
    ) {
        return this.servicesService.update(
            user.sub,
            id,
            dto,
        );
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteService(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.servicesService.deleteService(
            user.sub,
            id,
        );
    }

    @Get('branch/:branchId')
    getByBranch(
        @Param('branchId') branchId: string,
    ) {
        return this.servicesService.getByBranch(
            branchId,
        );
    }

    @Get('category/:category')
    getByCategory(
        @Param('category') category: string,
    ) {
        return this.servicesService.getByCategory(
            category,
        );
    }

    @Get('popular/all')
    getPopularServices() {
        return this.servicesService.getPopularServices();
    }

    @Get('search/all')
    searchServices(
        @Query() query: GetServicesDto,
    ) {
        return this.servicesService.searchServices(
            query,
        );
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetServicesDto,
    ) {
        return this.servicesService.getAllByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateServiceStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateServiceStatusDto,
    ) {
        return this.servicesService.updateServiceStatus(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteServiceByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.servicesService.deleteServiceByAdmin(
            user,
            id,
        );
    }

}