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

import { CustomersService } from './customers.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { UpdateCustomerStatusDto } from './dto/update-customer-status.dto';

@Controller('customers')
export class CustomersController {

    constructor(
        private readonly customersService: CustomersService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateCustomerDto,
    ) {
        return this.customersService.create(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetCustomersDto,
    ) {
        return this.customersService.getAll(
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
        return this.customersService.getById(
            user.sub,
            id,
        );
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateCustomerDto,
    ) {
        return this.customersService.update(
            user.sub,
            id,
            dto,
        );
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    deleteCustomer(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.customersService.deleteCustomer(
            user.sub,
            id,
        );
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetCustomersDto,
    ) {
        return this.customersService.getAllByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateCustomerStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateCustomerStatusDto,
    ) {
        return this.customersService.updateCustomerStatus(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteCustomerByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.customersService.deleteCustomerByAdmin(
            user,
            id,
        );
    }

}