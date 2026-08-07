import {

    BadRequestException,
    Injectable,

} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Service, ServiceDocument } from 'src/schemas/service.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { GetSalonServicesDto } from './dto/customer/get-salon-services.dto';
import { GetAvailableSlotsDto } from './dto/customer/get-available-slots.dto';
import { Appointment, AppointmentDocument } from 'src/schemas/appointment.schema';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { CreateBookingDto } from './dto/customer/create-booking.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { GetMyBookingsDto } from './dto/customer/get-my-bookings.dto';
import { CancelBookingDto } from './dto/customer/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/customer/reschedule-booking.dto';
import { GetSalonsDto } from './dto/customer/get-salons.dto';

@Injectable()

export class CustomerBookingService {

    constructor(

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(Service.name)
        private readonly serviceModel:
            Model<ServiceDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,

        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,

    ) { }

    async getSalons(
        query: GetSalonsDto,
    ) {

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {

            isDeleted: false,

            isActive: true,

            isSubscriptionActive: true,

        };

        if (query.city) {

            filter.city = {

                $regex: query.city,

                $options: 'i',

            };

        }

        if (query.state) {

            filter.state = {

                $regex: query.state,

                $options: 'i',

            };

        }

        // Search by salon name

        if (query.search) {

            filter.name = {

                $regex: query.search,

                $options: 'i',

            };

        }

        // Search by service category

        if (query.category) {

            const salonIds =

                await this.serviceModel.distinct(

                    'salonId',

                    {

                        category: {

                            $regex:
                                query.category,

                            $options: 'i',

                        },

                        isActive: true,

                        isDeleted: false,

                    },

                );

            filter._id = {

                $in: salonIds,

            };

        }

        const total =
            await this.salonModel.countDocuments(
                filter,
            );

        const salons =
            await this.salonModel.aggregate([

                {
                    $match: filter,
                },

                {
                    $lookup: {

                        from:
                            'branches',

                        let: {

                            salonId:
                                '$_id',

                        },

                        pipeline: [

                            {

                                $match: {

                                    $expr: {

                                        $eq: [

                                            '$salonId',

                                            '$$salonId',

                                        ],

                                    },

                                    isDeleted:
                                        false,

                                    isActive:
                                        true,

                                },

                            },

                        ],

                        as:
                            'branches',

                    },

                },

                {
                    $lookup: {

                        from:
                            'services',

                        let: {

                            salonId:
                                '$_id',

                        },

                        pipeline: [

                            {

                                $match: {

                                    $expr: {

                                        $eq: [

                                            '$salonId',

                                            '$$salonId',

                                        ],

                                    },

                                    isDeleted:
                                        false,

                                    isActive:
                                        true,

                                },

                            },

                        ],

                        as:
                            'services',

                    },

                },

                {

                    $addFields: {

                        totalBranches: {

                            $size:
                                '$branches',

                        },

                        totalServices: {

                            $size:
                                '$services',

                        },

                    },

                },

                {

                    $project: {

                        _id: 1,

                        salonId: 1,

                        name: 1,

                        logo: 1,

                        bannerImage: 1,

                        email: 1,

                        phone: 1,

                        address: 1,

                        city: 1,

                        state: 1,

                        country: 1,

                        pincode: 1,

                        description: 1,

                        latitude: 1,

                        longitude: 1,

                        totalBranches: 1,

                        totalServices: 1,

                    },

                },

                {

                    $sort: {

                        createdAt: -1,

                    },

                },

                {

                    $skip: skip,

                },

                {

                    $limit: limit,

                },

            ]);

        return {

            success: true,

            message:
                'Salons fetched successfully.',

            data:
                salons,

            pagination: {

                total,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),

            },

        };

    }

    async getSalonDetails(
        salonId: string,
    ) {

        const salon =
            await this.salonModel.findOne({

                _id: salonId,
                isDeleted: false,
                isActive: true,
                isSubscriptionActive: true,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const branches =
            await this.branchModel.find({

                salonId: salon._id,

                isDeleted: false,

                isActive: true,

            })
                .select(
                    `
            branchId
            name
            email
            phone
            address
            city
            state
            country
            pincode
            openingTime
            closingTime
            latitude
            longitude
            `,
                );

        const totalServices =
            await this.serviceModel.countDocuments({

                salonId: salon._id,

                isDeleted: false,

                isActive: true,

            });

        const totalStaff =
            await this.staffModel.countDocuments({

                salonId: salon._id,

                isDeleted: false,

                isActive: true,

            });

        return {

            success: true,

            message:
                'Salon details fetched successfully.',

            data: {

                salon,

                branches,

                totalBranches:
                    branches.length,

                totalServices,

                totalStaff,

            },

        };

    }

    async getSalonServices(
        query: GetSalonServicesDto,
    ) {

        const salon =
            await this.salonModel.findOne({

                _id: query.salonId,
                isDeleted: false,
                isActive: true,
                isSubscriptionActive: true,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const filter: any = {
            salonId: salon._id,
            isDeleted: false,
            isActive: true,

        };

        if (query.branchId) {

            filter.branchId = query.branchId;

        }

        if (query.category) {
            filter.category = {
                $regex: query.category,
                $options: 'i',

            };

        }

        const services =
            await this.serviceModel.find(filter)

                .populate({
                    path: 'branchId',
                    select: `
                    branchId
                    name
                    address
                    city
                `,

                })

                .sort({
                    category: 1,
                    name: 1,

                });

        return {

            success: true,
            message: 'Salon services fetched successfully.',
            data: services,

        };

    }

    async getBranchStaff(
        branchId: string,
    ) {

        const branch =
            await this.branchModel.findOne({
                _id: branchId,
                isDeleted: false,
                isActive: true,

            });

        if (!branch) {

            throw new BadRequestException(
                'Branch not found.',
            );

        }

        const staffs =
            await this.staffModel.find({
                branchId,
                salonId: branch.salonId,
                isDeleted: false,
                isActive: true,

            })
                .select(`
            staffId
            name
            profileImage
            designation
            experience
        `)
                .sort({
                    name: 1,
                });

        return {

            success: true,

            message:
                'Branch staff fetched successfully.',

            data: staffs,

        };

    }

    async availableSlots(
        query: GetAvailableSlotsDto,
    ) {

        const branch =
            await this.branchModel.findOne({

                _id: query.branchId,
                isDeleted: false,
                isActive: true,

            });

        if (!branch) {

            throw new BadRequestException(
                'Branch not found.',
            );

        }

        const staff =
            await this.staffModel.findOne({

                _id: query.staffId,
                branchId: query.branchId,
                isDeleted: false,
                isActive: true,

            });

        if (!staff) {

            throw new BadRequestException(
                'Staff not found.',
            );

        }

        const bookedAppointments =
            await this.appointmentModel.find({

                staffId: staff._id,

                appointmentDate: new Date(
                    query.appointmentDate,
                ),

                isCancelled: false,

            })
                .select('appointmentTime');

        const bookedSlots =
            bookedAppointments.map(
                item => item.appointmentTime,
            );

        const allSlots = [

            '09:00 AM',
            '09:30 AM',
            '10:00 AM',
            '10:30 AM',
            '11:00 AM',
            '11:30 AM',
            '12:00 PM',
            '12:30 PM',
            '01:00 PM',
            '01:30 PM',
            '02:00 PM',
            '02:30 PM',
            '03:00 PM',
            '03:30 PM',
            '04:00 PM',
            '04:30 PM',
            '05:00 PM',
            '05:30 PM',
            '06:00 PM',
            '06:30 PM',
            '07:00 PM',
            '07:30 PM',

        ];

        const availableSlots =
            allSlots.filter(
                slot =>
                    !bookedSlots.includes(slot),
            );

        return {

            success: true,

            message:
                'Available slots fetched successfully.',

            data: availableSlots,

        };

    }

    async createBooking(
        userId: string,
        dto: CreateBookingDto,
    ) {

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

        const salon =
            await this.salonModel.findOne({

                _id: dto.salonId,
                isDeleted: false,
                isActive: true,
                isSubscriptionActive: true,

            });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const branch =
            await this.branchModel.findOne({

                _id: dto.branchId,

                salonId: salon._id,

                isDeleted: false,

                isActive: true,

            });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        const staff =
            await this.staffModel.findOne({

                _id: dto.staffId,
                salonId: salon._id,
                branchId: dto.branchId,
                isDeleted: false,
                isActive: true,

            });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );
        }

        const services =
            await this.serviceModel.find({

                _id: {
                    $in: dto.serviceIds,
                },

                salonId: salon._id,
                branchId: dto.branchId,
                isDeleted: false,
                isActive: true,

            });

        if (
            services.length !==
            dto.serviceIds.length
        ) {
            throw new BadRequestException(
                'One or more services are invalid.',
            );
        }

        const customer =
            await this.customerModel.findOne({

                email: user.email,
                isDeleted: false,
                isActive: true,

            });

        if (!customer) {
            throw new BadRequestException(
                'Customer profile not found.',
            );
        }

        const alreadyBooked =
            await this.appointmentModel.findOne({

                staffId: staff._id,

                appointmentDate: new Date(
                    dto.appointmentDate,
                ),

                appointmentTime:
                    dto.appointmentTime,

                isCancelled: false,

            });

        if (alreadyBooked) {
            throw new BadRequestException(
                'Selected slot is already booked.',
            );
        }

        let totalAmount = 0;

        services.forEach(service => {

            totalAmount +=
                service.discountPrice ||
                service.price;

        });

        const totalAppointments =
            await this.appointmentModel.countDocuments();

        const appointmentId =
            `APT${String(
                totalAppointments + 1,
            ).padStart(6, '0')}`;

        const appointment =
            await this.appointmentModel.create({
                appointmentId,
                salonId: salon._id,
                branchId: branch._id,
                customerId: customer._id,
                staffId: staff._id,
                serviceIds: services.map(
                    item => item._id,
                ),
                appointmentDate: new Date(dto.appointmentDate),
                appointmentTime: dto.appointmentTime,
                totalAmount,
                discountAmount: 0,

                finalAmount:
                    totalAmount,

                paymentStatus:
                    'PENDING',

                appointmentStatus:
                    'PENDING',

                notes:
                    dto.notes,

            });

        return {

            success: true,

            message:
                'Appointment booked successfully.',

            data: appointment,

        };

    }

    async myBookings(
        userId: string,
        query: GetMyBookingsDto,
    ) {

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

        const customer =
            await this.customerModel.findOne({

                email: user.email,

                isDeleted: false,

                isActive: true,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer profile not found.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter = {

            customerId: customer._id,

            isDeleted: false,

        };

        const total =
            await this.appointmentModel.countDocuments(
                filter,
            );

        const appointments =
            await this.appointmentModel.find(filter)

                .populate({
                    path: 'salonId',
                    select: `
                    salonId
                    name
                    logo
                    phone
                    address
                    city
                `,
                })

                .populate({
                    path: 'branchId',
                    select: `
                    branchId
                    name
                    address
                `,
                })

                .populate({
                    path: 'staffId',
                    select: `
                    staffId
                    name
                    profileImage
                    designation
                `,
                })

                .populate({
                    path: 'serviceIds',
                    select: `
                    serviceId
                    name
                    price
                    duration
                `,
                })

                .sort({
                    appointmentDate: -1,
                    appointmentTime: -1,
                })

                .skip(skip)

                .limit(limit);

        return {

            success: true,

            message:
                'Bookings fetched successfully.',

            data: appointments,

            pagination: {

                total,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),

            },

        };

    }

    async cancelBooking(
        userId: string,
        dto: CancelBookingDto,
    ) {

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

        const customer =
            await this.customerModel.findOne({
                email: user.email,
                isDeleted: false,
                isActive: true,

            });

        if (!customer) {
            throw new BadRequestException(
                'Customer profile not found.',
            );

        }

        const appointment =
            await this.appointmentModel.findOne({

                _id: dto.appointmentId,

                customerId: customer._id,

                isDeleted: false,

            });

        if (!appointment) {

            throw new BadRequestException(
                'Appointment not found.',
            );

        }

        if (appointment.isCancelled) {

            throw new BadRequestException(
                'Appointment already cancelled.',
            );

        }

        if (appointment.isCompleted) {

            throw new BadRequestException(
                'Completed appointment cannot be cancelled.',
            );

        }

        appointment.isCancelled = true;

        appointment.appointmentStatus =
            'CANCELLED';

        appointment.notes =
            dto.reason ||
            appointment.notes;

        await appointment.save();

        return {

            success: true,

            message:
                'Appointment cancelled successfully.',

            data: appointment,

        };

    }

    async rescheduleBooking(
        userId: string,
        dto: RescheduleBookingDto,
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

        const customer =
            await this.customerModel.findOne({

                email:
                    user.email,

                isDeleted:
                    false,

                isActive:
                    true,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer profile not found.',
            );

        }

        const appointment =
            await this.appointmentModel.findOne({

                _id:
                    dto.appointmentId,

                customerId:
                    customer._id,

                isDeleted:
                    false,

            });

        if (!appointment) {

            throw new BadRequestException(
                'Appointment not found.',
            );

        }

        if (appointment.isCancelled) {

            throw new BadRequestException(
                'Cancelled appointment cannot be rescheduled.',
            );

        }

        if (appointment.isCompleted) {

            throw new BadRequestException(
                'Completed appointment cannot be rescheduled.',
            );

        }

        const alreadyBooked =
            await this.appointmentModel.findOne({

                _id: {
                    $ne: appointment._id,
                },

                staffId:
                    appointment.staffId,

                appointmentDate:
                    new Date(dto.appointmentDate),

                appointmentTime:
                    dto.appointmentTime,

                isCancelled:
                    false,

            });

        if (alreadyBooked) {

            throw new BadRequestException(
                'Selected slot is already booked.',
            );

        }

        appointment.appointmentDate =
            new Date(
                dto.appointmentDate,
            );

        appointment.appointmentTime =
            dto.appointmentTime;

        appointment.appointmentStatus =
            'PENDING';

        await appointment.save();

        return {

            success: true,

            message:
                'Appointment rescheduled successfully.',

            data:
                appointment,

        };

    }

}