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

import { SalonsService } from './salons.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { GetSalonsDto } from './dto/get-salons.dto';
import { UpdateSalonStatusDto } from './dto/update-salon-status.dto';


@Controller('salons')
export class SalonsController {

    constructor(
        private readonly salonsService: SalonsService,
    ) { }

    // SALON OWNER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateSalonDto,
    ) {
        return this.salonsService.create(
            user.sub,
            dto,
        );
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    profile(
        @CurrentUser() user: any,
    ) {
        return this.salonsService.profile(
            user.sub,
        );
    }

    @Patch('update')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Body() dto: UpdateSalonDto,
    ) {
        return this.salonsService.update(
            user.sub,
            dto,
        );
    }

    @Delete('delete')
    @UseGuards(JwtAuthGuard)
    deleteSalon(
        @CurrentUser() user: any,
    ) {
        return this.salonsService.deleteSalon(
            user.sub,
        );
    }


    // PUBLIC APIs

    @Get()
    getAllSalons(
        @Query() query: GetSalonsDto,
    ) {
        return this.salonsService.getAllSalons(
            query,
        );
    }

    @Get('search')
    searchSalons(
        @Query() query: GetSalonsDto,
    ) {
        return this.salonsService.searchSalons(
            query,
        );
    }

    @Get('city/:city')
    getSalonByCity(
        @Param('city') city: string,
    ) {
        return this.salonsService.getSalonByCity(
            city,
        );
    }

    @Get(':id')
    getSalonById(
        @Param('id') id: string,
    ) {
        return this.salonsService.getSalonById(
            id,
        );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllSalonByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetSalonsDto,
    ) {
        return this.salonsService.getAllSalonByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateSalonStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateSalonStatusDto,
    ) {
        return this.salonsService.updateSalonStatus(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteSalonByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.salonsService.deleteSalonByAdmin(
            user,
            id,
        );
    }

}