import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance, AttendanceDocument } from 'src/schemas/attendance.schema';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class AttendanceService {

    constructor(
        @InjectModel(Attendance.name)
        private readonly attendanceModel:
            Model<AttendanceDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,
    ) { }

    async checkIn(
        userId: string,
        dto: CheckInDto,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const staff =
            await this.staffModel.findOne({

                _id: dto.staffId,

                salonId: salon._id,

                isDeleted: false,

                isActive: true,

            });

        if (!staff) {

            throw new BadRequestException(
                'Staff not found.',
            );

        }

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0,
        );

        const alreadyCheckedIn =
            await this.attendanceModel.findOne({

                staffId: staff._id,

                date: today,

                isDeleted: false,

            });

        if (alreadyCheckedIn) {

            throw new BadRequestException(
                'Staff has already checked in today.',
            );

        }

        const totalAttendance =
            await this.attendanceModel
                .countDocuments();

        const attendanceId =
            `ATT${String(
                totalAttendance + 1,
            ).padStart(6, '0')}`;

        const now =
            new Date();

        const checkInTime =
            now.toLocaleTimeString(
                'en-IN',
                {

                    hour: '2-digit',

                    minute: '2-digit',

                    hour12: true,

                },

            );

        const isLate =
            now.getHours() >= 10;

        const attendance =
            await this.attendanceModel.create({

                attendanceId,

                salonId:
                    salon._id,

                branchId:
                    staff.branchId,

                staffId:
                    staff._id,

                date:
                    today,

                checkInTime,

                status:
                    'PRESENT',

                isLate,

                remarks:
                    dto.remarks,

                isActive:
                    true,

                isDeleted:
                    false,

            });

        return {

            success: true,

            message:
                'Check-in successful.',

            data:
                attendance,

        };

    }

    async checkOut(
        userId: string,
        dto: CheckOutDto,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const attendance =
            await this.attendanceModel.findOne({

                attendanceId:
                    dto.attendanceId,

                salonId:
                    salon._id,

                isDeleted:
                    false,

            });

        if (!attendance) {

            throw new BadRequestException(
                'Attendance not found.',
            );

        }

        if (attendance.checkOutTime) {

            throw new BadRequestException(
                'Staff has already checked out.',
            );

        }

        const now =
            new Date();

        const checkOutTime =
            now.toLocaleTimeString(
                'en-IN',
                {

                    hour: '2-digit',

                    minute: '2-digit',

                    hour12: true,

                },

            );

        const checkInDateTime =
            new Date(
                `${attendance.date.toDateString()} ${attendance.checkInTime}`,
            );

        const diffInMilliseconds =
            now.getTime() -
            checkInDateTime.getTime();

        const workingHours =
            Number(
                (
                    diffInMilliseconds /
                    (1000 * 60 * 60)
                ).toFixed(2),
            );

        attendance.checkOutTime =
            checkOutTime;

        attendance.workingHours =
            workingHours;

        attendance.remarks =
            dto.remarks ||
            attendance.remarks;

        if (workingHours < 4) {

            attendance.isHalfDay =
                true;

            attendance.status =
                'HALF_DAY';

        }

        await attendance.save();

        return {
            success: true,
            message:
                'Check-out successful.',
            data:
                attendance,

        };

    }

    async getAll(
        userId: string,
        query: GetAttendanceDto,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {
            salonId: salon._id,
            isDeleted: false,

        };

        if (query.search) {
            filter.$or = [
                {
                    attendanceId: {
                        $regex: query.search,
                        $options: 'i',
                    },

                },

                {
                    status: {
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

        const totalAttendance =
            await this.attendanceModel
                .countDocuments(
                    filter,
                );

        const attendance =
            await this.attendanceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('staffId')
                .populate('branchId')
                .populate('salonId');

        return {
            success: true,
            message:
                'Attendance fetched successfully.',
            data:
                attendance,
            pagination: {
                total:
                    totalAttendance,
                page,
                limit,
                totalPages:
                    Math.ceil(
                        totalAttendance /
                        limit,
                    ),

            },

        };

    }

    async getById(
        userId: string,
        id: string,
    ) {
        const salon =
            await this.salonModel.findOne({
                ownerId: userId,
                isDeleted: false,

            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const attendance =
            await this.attendanceModel
                .findOne({
                    _id: id,
                    salonId: salon._id,
                    isDeleted: false,

                })

                .populate('staffId')
                .populate('branchId')
                .populate('salonId');

        if (!attendance) {

            throw new BadRequestException(
                'Attendance not found.',
            );

        }

        return {
            success: true,
            message:
                'Attendance fetched successfully.',
            data:
                attendance,

        };

    }

    async getStaffAttendance(
        userId: string,
        staffId: string,
    ) {

        const salon =
            await this.salonModel.findOne({
                ownerId: userId,
                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const staff =
            await this.staffModel.findOne({
                _id: staffId,
                salonId: salon._id,
                isDeleted: false,

            });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );

        }

        const attendance =
            await this.attendanceModel
                .find({
                    staffId: staff._id,
                    isDeleted: false,

                })
                .sort({
                    date: -1,

                })
                .populate('staffId')
                .populate('branchId')
                .populate('salonId');

        return {
            success: true,
            message:
                'Staff attendance fetched successfully.',
            data:
                attendance,

        };

    }

    async getBranchAttendance(
        userId: string,
        branchId: string,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const branch =
            await this.branchModel.findOne({

                _id: branchId,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!branch) {

            throw new BadRequestException(
                'Branch not found.',
            );

        }

        const attendance =
            await this.attendanceModel
                .find({

                    branchId: branch._id,

                    isDeleted: false,

                })

                .sort({

                    date: -1,

                })

                .populate('staffId')
                .populate('branchId')
                .populate('salonId');

        return {

            success: true,

            message:
                'Branch attendance fetched successfully.',

            data:
                attendance,

        };

    }

    async getTodayAttendance(
        userId: string,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const startOfDay =
            new Date();

        startOfDay.setHours(
            0,
            0,
            0,
            0,
        );

        const endOfDay =
            new Date();

        endOfDay.setHours(
            23,
            59,
            59,
            999,
        );

        const attendance =
            await this.attendanceModel
                .find({

                    salonId: salon._id,

                    date: {

                        $gte:
                            startOfDay,

                        $lte:
                            endOfDay,

                    },

                    isDeleted: false,

                })

                .populate('staffId')
                .populate('branchId')
                .populate('salonId')

                .sort({

                    createdAt: -1,

                });

        return {
            success: true,
            message:
                'Today attendance fetched successfully.',
            data:
                attendance,

        };

    }

    async searchAttendance(
        query: GetAttendanceDto,
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

                    attendanceId: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {

                    status: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {

                    remarks: {

                        $regex:
                            query.search,

                        $options:
                            'i',

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

        const totalAttendance =
            await this.attendanceModel
                .countDocuments(
                    filter,
                );

        const attendance =
            await this.attendanceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('staffId')
                .populate('branchId')
                .populate('salonId');

        return {
            success: true,
            message:
                'Attendance fetched successfully.',
            data:
                attendance,
            pagination: {
                total:
                    totalAttendance,
                page,
                limit,
                totalPages:
                    Math.ceil(
                        totalAttendance /
                        limit,
                    ),

            },

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetAttendanceDto,
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
                    attendanceId: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {
                    status: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {
                    remarks: {

                        $regex:
                            query.search,

                        $options:
                            'i',

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

        const totalAttendance =
            await this.attendanceModel
                .countDocuments(
                    filter,
                );

        const attendance =
            await this.attendanceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('staffId')
                .populate('branchId')
                .populate('salonId');

        return {
            success: true,
            message:
                'Attendance fetched successfully.',
            data:
                attendance,
            pagination: {
                total:
                    totalAttendance,
                page,
                limit,
                totalPages:
                    Math.ceil(
                        totalAttendance /
                        limit,
                    ),

            },

        };

    }

    async updateAttendanceStatus(
        user: any,
        id: string,
        dto: UpdateAttendanceStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const attendance =
            await this.attendanceModel.findById(
                id,
            );

        if (!attendance) {

            throw new BadRequestException(
                'Attendance record not found.',
            );

        }

        Object.assign(
            attendance,
            dto,
        );

        await attendance.save();
        return {
            success: true,
            message:
                'Attendance status updated successfully.',
            data:
                attendance,

        };

    }

    async deleteAttendanceByAdmin(
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
        const attendance =
            await this.attendanceModel.findById(
                id,
            );

        if (!attendance) {

            throw new BadRequestException(
                'Attendance record not found.',
            );

        }
        attendance.isDeleted = true;
        attendance.isActive = false;
        await attendance.save();
        return {
            success: true,
            message:
                'Attendance deleted successfully.',

        };

    }

}