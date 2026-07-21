import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationDocument, Notifications } from 'src/schemas/notification.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class NotificationsService {

    constructor(
        @InjectModel(Notifications.name)
        private readonly notificationModel:
            Model<NotificationDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,
    ) { }

    async createNotification(
        userId: string,
        dto: CreateNotificationDto,
    ) {

        const user =
            await this.userModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        const totalNotifications =
            await this.notificationModel
                .countDocuments();

        const notificationId =
            `NOT${String(
                totalNotifications + 1,
            ).padStart(6, '0')}`;

        const notification =
            await this.notificationModel.create({
                notificationId,
                userId: user._id,
                title:
                    dto.title,
                message:
                    dto.message,
                type:
                    dto.type,
                referenceId:
                    dto.referenceId,
                referenceType:
                    dto.referenceType,
                isRead:
                    false,
                isActive:
                    true,
                isDeleted:
                    false,

            });


        // EMAIL NOTIFICATION

        if (dto.type === 'EMAIL') {

            // CALL MAIL SERVICE HERE

            // await this.mailQueueService.sendMail(...);

        }


        // PUSH NOTIFICATION

        if (dto.type === 'PUSH') {

            // FIREBASE LOGIC WILL COME HERE

        }


        return {
            success: true,
            message:
                'Notification created successfully.',
            data:
                notification,

        };

    }

    async getAll(
        userId: string,
        query: GetNotificationsDto,
    ) {

        const user =
            await this.userModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;


        const filter: any = {

            userId:
                user._id,

            isDeleted:
                false,

        };


        if (query.search) {

            filter.title = {

                $regex:
                    query.search,

                $options:
                    'i',

            };

        }


        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };


        const totalNotifications =
            await this.notificationModel
                .countDocuments(
                    filter,
                );


        const notifications =
            await this.notificationModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit);


        return {

            success: true,

            message:
                'Notifications fetched successfully.',

            data:
                notifications,

            pagination: {

                total:
                    totalNotifications,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalNotifications /
                        limit,
                    ),

            },

        };

    }

    async getById(
        userId: string,
        id: string,
    ) {

        const user =
            await this.userModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        const notification =
            await this.notificationModel
                .findOne({

                    _id: id,

                    userId: user._id,

                    isDeleted: false,

                });

        if (!notification) {

            throw new BadRequestException(
                'Notification not found.',
            );

        }

        return {

            success: true,

            message:
                'Notification fetched successfully.',

            data:
                notification,

        };

    }

    async markAsRead(
        userId: string,
        id: string,
        dto: MarkAsReadDto,
    ) {

        const user =
            await this.userModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        const notification =
            await this.notificationModel
                .findOne({

                    _id: id,

                    userId: user._id,

                    isDeleted: false,

                });

        if (!notification) {

            throw new BadRequestException(
                'Notification not found.',
            );

        }

        notification.isRead =
            dto.isRead;
        await notification.save();

        return {
            success: true,
            message:
                'Notification marked successfully.',
            data:
                notification,

        };

    }

    async markAllAsRead(
        userId: string,
    ) {
        const user =
            await this.userModel.findOne({
                _id: userId,
                isDeleted: false,
            });

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );
        }
        await this.notificationModel
            .updateMany(
                {
                    userId: user._id,
                    isDeleted: false,
                    isRead: false,
                },

                {
                    $set: {
                        isRead: true,
                    },

                },

            );

        return {

            success: true,

            message:
                'All notifications marked as read successfully.',

        };

    }

    async deleteNotification(
        userId: string,
        id: string,
    ) {

        const user =
            await this.userModel.findOne({

                _id: userId,

                isDeleted: false,

            });

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        const notification =
            await this.notificationModel.findOne({

                _id: id,

                userId: user._id,

                isDeleted: false,

            });

        if (!notification) {

            throw new BadRequestException(
                'Notification not found.',
            );

        }

        notification.isDeleted = true;

        notification.isActive = false;

        await notification.save();

        return {

            success: true,

            message:
                'Notification deleted successfully.',

        };

    }

    async searchNotifications(
        query: GetNotificationsDto,
    ) {

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {

            isDeleted: false,

        };

        if (query.search) {

            filter.$or = [

                {

                    title: {

                        $regex: query.search,

                        $options: 'i',

                    },

                },

                {

                    message: {

                        $regex: query.search,

                        $options: 'i',

                    },

                },

                {

                    type: {

                        $regex: query.search,

                        $options: 'i',

                    },

                },

            ];

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalNotifications =
            await this.notificationModel
                .countDocuments(
                    filter,
                );

        const notifications =
            await this.notificationModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'userId',
                );

        return {

            success: true,

            message:
                'Notifications fetched successfully.',

            data:
                notifications,

            pagination: {

                total:
                    totalNotifications,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalNotifications /
                        limit,
                    ),

            },

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetNotificationsDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {};

        if (query.search) {

            filter.$or = [

                {

                    title: {

                        $regex: query.search,

                        $options: 'i',

                    },

                },

                {

                    message: {

                        $regex: query.search,

                        $options: 'i',

                    },

                },

                {

                    type: {

                        $regex: query.search,

                        $options: 'i',

                    },

                },

            ];

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalNotifications =
            await this.notificationModel
                .countDocuments(
                    filter,
                );

        const notifications =
            await this.notificationModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'userId',
                );

        return {

            success: true,

            message:
                'Notifications fetched successfully.',

            data:
                notifications,

            pagination: {

                total:
                    totalNotifications,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalNotifications /
                        limit,
                    ),

            },

        };

    }

    async updateNotificationStatus(
        user: any,
        id: string,
        dto: UpdateNotificationStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const notification =
            await this.notificationModel.findById(
                id,
            );

        if (!notification) {
            throw new BadRequestException(
                'Notification not found.',
            );

        }

        Object.assign(
            notification,
            dto,
        );
        await notification.save();
        return {
            success: true,
            message:
                'Notification status updated successfully.',
            data:
                notification,

        };

    }

    async deleteNotificationByAdmin(
        user: any,
        id: string,
    ) {
        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }
        const notification =
            await this.notificationModel.findById(
                id,
            );

        if (!notification) {

            throw new BadRequestException(
                'Notification not found.',
            );

        }
        notification.isDeleted = true;
        notification.isActive = false;
        await notification.save();
        return {
            success: true,
            message:
                'Notification deleted successfully.',

        };

    }

}