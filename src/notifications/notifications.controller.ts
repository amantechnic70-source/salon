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

import { NotificationsService } from './notifications.service';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';

@Controller('notifications')
export class NotificationsController {

    constructor(
        private readonly notificationsService:
            NotificationsService,
    ) { }


    // USER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createNotification(
        @CurrentUser() user: any,
        @Body() dto: CreateNotificationDto,
    ) {
        return this.notificationsService
            .createNotification(
                user.sub,
                dto,
            );
    }


    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetNotificationsDto,
    ) {
        return this.notificationsService
            .getAll(
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
        return this.notificationsService
            .getById(
                user.sub,
                id,
            );
    }


    @Patch('read/:id')
    @UseGuards(JwtAuthGuard)
    markAsRead(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: MarkAsReadDto,
    ) {
        return this.notificationsService
            .markAsRead(
                user.sub,
                id,
                dto,
            );
    }


    @Patch('read-all')
    @UseGuards(JwtAuthGuard)
    markAllAsRead(
        @CurrentUser() user: any,
    ) {
        return this.notificationsService
            .markAllAsRead(
                user.sub,
            );
    }


    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    deleteNotification(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.notificationsService
            .deleteNotification(
                user.sub,
                id,
            );
    }


    // PUBLIC API

    @Get('search/all')
    searchNotifications(
        @Query() query: GetNotificationsDto,
    ) {
        return this.notificationsService
            .searchNotifications(
                query,
            );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetNotificationsDto,
    ) {
        return this.notificationsService
            .getAllByAdmin(
                user,
                query,
            );
    }


    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteNotificationByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.notificationsService
            .deleteNotificationByAdmin(
                user,
                id,
            );
    }

}