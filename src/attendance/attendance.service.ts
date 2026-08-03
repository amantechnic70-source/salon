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

        // ==========================================
        // 1. FIND LOGGED-IN USER
        // ==========================================

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


        // ==========================================
        // 2. CHECK USER ROLE
        // ==========================================

        if (
            user.role !==
            UserRole.STAFF
        ) {

            throw new BadRequestException(
                'Only staff members can check in.',
            );

        }


        // ==========================================
        // 3. FIND STAFF PROFILE
        // JWT sub = User._id
        // Staff.userId = User._id
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


        // ==========================================
        // 4. CHECK STAFF ACTIVE
        // ==========================================

        if (!staff.isActive) {

            throw new BadRequestException(
                'Staff account is inactive.',
            );

        }


        // ==========================================
        // 5. CHECK STAFF SALON
        // ==========================================

        if (!staff.salonId) {

            throw new BadRequestException(
                'Salon is not assigned to this staff member.',
            );

        }


        // ==========================================
        // 6. FIND SALON
        // ==========================================

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
        // 7. CHECK SALON ACTIVE
        // ==========================================

        if (!salon.isActive) {

            throw new BadRequestException(
                'Salon is inactive.',
            );

        }


        // ==========================================
        // 8. CHECK SALON SUBSCRIPTION FLAG
        // ==========================================

        if (!salon.isSubscriptionActive) {

            throw new BadRequestException(
                'Salon subscription is inactive.',
            );

        }


        // ==========================================
        // 9. FIND ACTIVE SUBSCRIPTION
        // ==========================================

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


        // ==========================================
        // 10. CHECK STAFF BRANCH
        // ==========================================

        if (!staff.branchId) {

            throw new BadRequestException(
                'Branch is not assigned to this staff member.',
            );

        }


        // ==========================================
        // 11. FIND BRANCH
        // Also verify branch belongs to same salon
        // ==========================================

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


        // ==========================================
        // 12. CHECK BRANCH ACTIVE
        // ==========================================

        if (!branch.isActive) {

            throw new BadRequestException(
                'Assigned branch is inactive.',
            );

        }


        // ==========================================
        // 13. CREATE TODAY DATE RANGE
        // ==========================================

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
        // 14. CHECK TODAY ATTENDANCE
        // ==========================================

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
                AttendanceStatus.HALF_DAY;

        } else {

            attendance.isHalfDay =
                false;

            attendance.status =
                AttendanceStatus.PRESENT;

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