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

import { InvoicesService } from './invoices.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetInvoicesDto } from './dto/get-invoices.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@Controller('invoices')
export class InvoicesController {

    constructor(
        private readonly invoicesService:
            InvoicesService,
    ) { }


    // SALON OWNER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createInvoice(
        @CurrentUser() user: any,
        @Body() dto: CreateInvoiceDto,
    ) {
        return this.invoicesService.createInvoice(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetInvoicesDto,
    ) {
        return this.invoicesService.getAll(
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
        return this.invoicesService.getById(
            user.sub,
            id,
        );
    }

    @Get('download/:id')
    @UseGuards(JwtAuthGuard)
    downloadInvoice(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.invoicesService.downloadInvoice(
            user.sub,
            id,
        );
    }

    @Get('customer/:customerId')
    @UseGuards(JwtAuthGuard)
    getByCustomer(
        @CurrentUser() user: any,
        @Param('customerId')
        customerId: string,
    ) {
        return this.invoicesService.getByCustomer(
            user.sub,
            customerId,
        );
    }

    @Get('appointment/:appointmentId')
    @UseGuards(JwtAuthGuard)
    getByAppointment(
        @CurrentUser() user: any,
        @Param('appointmentId')
        appointmentId: string,
    ) {
        return this.invoicesService.getByAppointment(
            user.sub,
            appointmentId,
        );
    }


    // PUBLIC API

    @Get('search/all')
    searchInvoices(
        @Query() query: GetInvoicesDto,
    ) {
        return this.invoicesService.searchInvoices(
            query,
        );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetInvoicesDto,
    ) {
        return this.invoicesService.getAllByAdmin(
            user,
            query,
        );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateInvoiceStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateInvoiceStatusDto,
    ) {
        return this.invoicesService.updateInvoiceStatus(
            user,
            id,
            dto,
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteInvoiceByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.invoicesService.deleteInvoiceByAdmin(
            user,
            id,
        );
    }

}