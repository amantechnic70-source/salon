import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

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
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { Subscription, SubscriptionDocument } from 'src/schemas/subscription.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { AttendanceStatus } from 'src/common/enums/attendanceStatus.status.enum';

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

        @InjectModel(Subscription.name)
        private readonly subscriptionModel:
            Model<SubscriptionDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,
    ) { }

    async checkIn(
        userId: string,
    ) {

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        if (user.isDeleted) {

            throw new BadRequestException(
                'User account has been deleted.',
            );

        }

        if (!user.isActive) {

            throw new BadRequestException(
                'User account is inactive.',
            );

        }

        if (
            user.role !==
            UserRole.STAFF
        ) {

            throw new BadRequestException(
                'Only staff members can check in.',
            );

        }

        const staff =
            await this.staffModel.findOne({

                userId:
                    user.userId,

                isDeleted:
                    false,

            });

        if (!staff) {

            throw new BadRequestException(
                'Staff profile not found.',
            );

        }

        if (!staff.isActive) {

            throw new BadRequestException(
                'Staff account is inactive.',
            );

        }

        if (!staff.salonId) {

            throw new BadRequestException(
                'Salon is not assigned to this staff member.',
            );

        }

        const salon =
            await this.salonModel.findOne({

                _id:
                    staff.salonId,

                isDeleted:
                    false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        if (!salon.isActive) {

            throw new BadRequestException(
                'Salon is inactive.',
            );

        }

        if (!salon.isSubscriptionActive) {

            throw new BadRequestException(
                'Salon subscription is inactive.',
            );

        }


        const now =
            new Date();

        const subscription =
            await this.subscriptionModel.findOne({

                salonId:
                    salon._id,

                status:
                    SubscriptionStatus.ACTIVE,

                isActive:
                    true,

                expiryDate: {
                    $gt:
                        now,
                },

            });

        console.log("subscription is", subscription)

        const allSubscriptions =
            await this.subscriptionModel.find();

        console.log("All subscriptions:", allSubscriptions);


        if (!subscription) {

            throw new BadRequestException(
                'Salon does not have an active subscription.',
            );

        }

        if (!staff.branchId) {

            throw new BadRequestException(
                'Branch is not assigned to this staff member.',
            );

        }


        const branch =
            await this.branchModel.findOne({

                _id:
                    staff.branchId,

                salonId:
                    salon._id,

                isDeleted:
                    false,

            });

        if (!branch) {

            throw new BadRequestException(
                'Assigned branch not found.',
            );

        }

        if (!branch.isActive) {

            throw new BadRequestException(
                'Assigned branch is inactive.',
            );

        }

        const startOfDay =
            new Date(now);

        startOfDay.setHours(
            0,
            0,
            0,
            0,
        );


        const endOfDay =
            new Date(now);

        endOfDay.setHours(
            23,
            59,
            59,
            999,
        );


        const existingAttendance =
            await this.attendanceModel.findOne({

                staffId:
                    staff._id,

                salonId:
                    salon._id,

                date: {

                    $gte:
                        startOfDay,

                    $lte:
                        endOfDay,

                },

                isDeleted:
                    false,

            });

        if (existingAttendance) {

            throw new BadRequestException(
                'You have already checked in today.',
            );

        }


        // ==========================================
        // 15. GENERATE ATTENDANCE ID
        // ==========================================

        const totalAttendance =
            await this.attendanceModel
                .countDocuments();


        const attendanceId =
            `ATT${String(
                totalAttendance + 1,
            ).padStart(
                6,
                '0',
            )}`;


        // ==========================================
        // 16. GENERATE CHECK-IN TIME
        // ==========================================

        const checkInTime =
            now.toLocaleTimeString(
                'en-IN',
                {

                    hour12:
                        false,

                    hour:
                        '2-digit',

                    minute:
                        '2-digit',

                    second:
                        '2-digit',

                    timeZone:
                        'Asia/Kolkata',

                },
            );


        // ==========================================
        // 17. CREATE ATTENDANCE
        // ==========================================

        const attendance =
            await this.attendanceModel.create({

                attendanceId,

                salonId:
                    salon._id,

                branchId:
                    branch._id,

                staffId:
                    staff._id,

                date:
                    now,

                checkInTime,

                workingHours:
                    0,

                status:
                    AttendanceStatus.PRESENT,

                isLate:
                    false,

                isHalfDay:
                    false,

                isActive:
                    true,

                isDeleted:
                    false,

            });


        // ==========================================
        // 18. RETURN RESPONSE
        // ==========================================

        return {

            success:
                true,

            message:
                'Checked in successfully.',

            data:
                attendance,

        };

    }

    async checkOut(
        userId: string,
        dto: CheckOutDto,
    ) {

        // ==========================================
        // 1. FIND LOGGED-IN USER
        // ==========================================

        const user =
            await this.userModel.findById(userId);

        if (!user) {
            throw new BadRequestException(
                'User not found.',
            );
        }

        if (user.isDeleted) {
            throw new BadRequestException(
                'User account has been deleted.',
            );
        }

        if (!user.isActive) {
            throw new BadRequestException(
                'User account is inactive.',
            );
        }

        if (user.role !== UserRole.STAFF) {
            throw new BadRequestException(
                'Only staff members can check out.',
            );
        }

        // ==========================================
        // 2. FIND STAFF
        // ==========================================

        const staff =
            await this.staffModel.findOne({

                userId:
                    user.userId,

                isDeleted:
                    false,

            });

        if (!staff) {
            throw new BadRequestException(
                'Staff profile not found.',
            );
        }

        if (!staff.isActive) {
            throw new BadRequestException(
                'Staff account is inactive.',
            );
        }


        const salon =
            await this.salonModel.findOne({

                _id:
                    staff.salonId,

                isDeleted:
                    false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        // ==========================================
        // 3. TODAY DATE RANGE
        // ==========================================

        const now =
            new Date();

        const startOfDay =
            new Date(now);

        startOfDay.setHours(
            0,
            0,
            0,
            0,
        );

        const endOfDay =
            new Date(now);

        endOfDay.setHours(
            23,
            59,
            59,
            999,
        );

        // ==========================================
        // 4. FIND TODAY'S OPEN ATTENDANCE
        // ==========================================

        const attendance =
            await this.attendanceModel.findOne({

                staffId:
                    staff._id,

                date: {

                    $gte:
                        startOfDay,

                    $lte:
                        endOfDay,

                },

                checkOutTime:
                {
                    $in: [
                        null,
                        '',
                    ],
                },

                isDeleted:
                    false,

            });

        if (!attendance) {

            throw new BadRequestException(
                'No active check-in found for today.',
            );

        }

        // ==========================================
        // 5. PREVENT DUPLICATE CHECKOUT
        // ==========================================

        if (attendance.checkOutTime) {

            throw new BadRequestException(
                'You have already checked out today.',
            );

        }

        // ==========================================
        // 6. CALCULATE WORKING HOURS
        // ==========================================

        const checkOutTime =
            now.toLocaleTimeString(
                'en-IN',
                {

                    hour12:
                        false,

                    hour:
                        '2-digit',

                    minute:
                        '2-digit',

                    second:
                        '2-digit',

                    timeZone:
                        'Asia/Kolkata',

                },
            );

        const checkIn =
            new Date(
                `${attendance.date.toDateString()} ${attendance.checkInTime}`,
            );

        const diffMs =
            now.getTime() -
            checkIn.getTime();

        const workingHours =
            Number(
                (
                    diffMs /
                    (1000 * 60 * 60)
                ).toFixed(2),
            );

        // ==========================================
        // 7. HALF DAY
        // ==========================================

        attendance.isHalfDay =
            workingHours < 4;

        // ==========================================
        // 8. UPDATE ATTENDANCE
        // ==========================================

        attendance.checkOutTime =
            checkOutTime;

        attendance.workingHours =
            workingHours;

        attendance.remarks =
            dto.remarks || '';

        await attendance.save();

        // ==========================================
        // 9. RETURN
        // ==========================================

        return {

            success:
                true,

            message:
                'Checked out successfully.',

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