import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { GetServicesDto } from './dto/get-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from 'src/schemas/service.schema';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class ServicesService {

    constructor(
        @InjectModel(Service.name)
        private readonly serviceModel:
            Model<ServiceDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateServiceDto,
    ) {

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new UnauthorizedException(
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
            UserRole.SALON_OWNER
        ) {

            throw new UnauthorizedException(
                'Only salon owners can create services.',
            );

        }

        // ==========================================
        // CHECK SALON ID
        // ==========================================

        if (!user.salonId) {

            throw new BadRequestException(
                'Please complete salon onboarding first.',
            );

        }

        // ==========================================
        // FIND SALON
        // ==========================================

        const salon =
            await this.salonModel.findOne({

                _id:
                    user.salonId,

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
                'Please activate your subscription plan first.',
            );

        }

        // ==========================================
        // FIND BRANCH
        // ==========================================

        const branch =
            await this.branchModel.findOne({

                _id:
                    dto.branchId,

                salonId:
                    salon._id,

                isDeleted:
                    false,

            });

        if (!branch) {

            throw new BadRequestException(
                'Branch not found.',
            );

        }

        if (!branch.isActive) {

            throw new BadRequestException(
                'Branch is inactive.',
            );

        }

        // ==========================================
        // GENERATE SERVICE ID
        // ==========================================

        const totalServices =
            await this.serviceModel.countDocuments();

        const serviceId =
            `SER${String(
                totalServices + 1,
            ).padStart(
                6,
                '0',
            )}`;

        // ==========================================
        // CALCULATE DISCOUNT PRICE
        // ==========================================

        const discountPrice =
            dto.discount
                ? dto.price -
                (
                    dto.price *
                    dto.discount
                ) / 100
                : dto.price;

        // ==========================================
        // CREATE SERVICE
        // ==========================================

        const service =
            await this.serviceModel.create({

                serviceId,

                salonId:
                    salon._id,

                branchId:
                    branch._id,

                name:
                    dto.name,

                description:
                    dto.description,

                price:
                    dto.price,

                discount:
                    dto.discount,

                discountPrice,

                duration:
                    dto.duration,

                serviceImage:
                    dto.serviceImage,

                category:
                    dto.category,

                isActive:
                    true,

                isDeleted:
                    false,

            });

        return {

            success: true,

            message:
                'Service created successfully.',

            data:
                service,

        };

    }

    async getAll(
        userId: string,
        query: GetServicesDto,
    ) {

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new UnauthorizedException(
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
            UserRole.SALON_OWNER
        ) {

            throw new UnauthorizedException(
                'Only salon owners can create services.',
            );

        }

        // ==========================================
        // CHECK SALON ID
        // ==========================================

        if (!user.salonId) {

            throw new BadRequestException(
                'Please complete salon onboarding first.',
            );

        }

        // ==========================================
        // FIND SALON
        // ==========================================

        const salon =
            await this.salonModel.findOne({

                _id:
                    user.salonId,

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
                'Please activate your subscription plan first.',
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
            filter.name = {
                $regex: query.search,
                $options: 'i',
            };
        }

        if (query.branchId) {
            filter.branchId =
                query.branchId;
        }

        if (query.category) {
            filter.category =
                query.category;
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalServices =
            await this.serviceModel.countDocuments(
                filter,
            );

        const services =
            await this.serviceModel.find(
                filter,
            )
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('branchId');

        return {
            success: true,
            message:
                'Services fetched successfully.',
            data: services,
            pagination: {
                total: totalServices,
                page,
                limit,
                totalPages: Math.ceil(
                    totalServices / limit,
                ),
            },
        };

    }

    async getById(
        userId: string,
        id: string,
    ) {

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new UnauthorizedException(
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
            UserRole.SALON_OWNER
        ) {

            throw new UnauthorizedException(
                'Only salon owners can create services.',
            );

        }

        // ==========================================
        // CHECK SALON ID
        // ==========================================

        if (!user.salonId) {

            throw new BadRequestException(
                'Please complete salon onboarding first.',
            );

        }

        // ==========================================
        // FIND SALON
        // ==========================================

        const salon =
            await this.salonModel.findOne({

                _id:
                    user.salonId,

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
                'Please activate your subscription plan first.',
            );

        }


        const service =
            await this.serviceModel.findOne({
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            })
                .populate('branchId');

        if (!service) {
            throw new BadRequestException(
                'Service not found.',
            );
        }

        return {
            success: true,
            message:
                'Service fetched successfully.',
            data: service,
        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateServiceDto,
    ) {

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new UnauthorizedException(
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
            UserRole.SALON_OWNER
        ) {

            throw new UnauthorizedException(
                'Only salon owners can create services.',
            );

        }

        // ==========================================
        // CHECK SALON ID
        // ==========================================

        if (!user.salonId) {

            throw new BadRequestException(
                'Please complete salon onboarding first.',
            );

        }

        // ==========================================
        // FIND SALON
        // ==========================================

        const salon =
            await this.salonModel.findOne({

                _id:
                    user.salonId,

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
                'Please activate your subscription plan first.',
            );

        }


        const service = await this.serviceModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!service) {
            throw new BadRequestException(
                'Service not found.',
            );
        }

        if (dto.branchId) {

            const branch = await this.branchModel.findOne({
                _id: dto.branchId,
                salonId: salon._id,
                isDeleted: false,
            });

            if (!branch) {
                throw new BadRequestException(
                    'Branch not found.',
                );
            }

        }

        Object.assign(
            service,
            dto,
        );

        const price =
            dto.price ?? service.price;

        const discount =
            dto.discount ?? service.discount;

        service.discountPrice =
            price -
            ((price * discount) / 100);

        await service.save();

        return {
            success: true,
            message:
                'Service updated successfully.',
            data: service,
        };

    }

    async deleteService(
        userId: string,
        id: string,
    ) {

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new UnauthorizedException(
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
            UserRole.SALON_OWNER
        ) {

            throw new UnauthorizedException(
                'Only salon owners can create services.',
            );

        }

        // ==========================================
        // CHECK SALON ID
        // ==========================================

        if (!user.salonId) {

            throw new BadRequestException(
                'Please complete salon onboarding first.',
            );

        }

        // ==========================================
        // FIND SALON
        // ==========================================

        const salon =
            await this.salonModel.findOne({

                _id:
                    user.salonId,

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
                'Please activate your subscription plan first.',
            );

        }


        const service = await this.serviceModel.findOne({
            _id: id,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!service) {
            throw new BadRequestException(
                'Service not found.',
            );
        }

        service.isDeleted = true;

        await service.save();

        return {
            success: true,
            message:
                'Service deleted successfully.',
        };

    }

    async getByBranch(
        branchId: string,
    ) {

        const branch = await this.branchModel.findOne({
            _id: branchId,
            isDeleted: false,
            isActive: true,
        });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        const services = await this.serviceModel.find({
            branchId,
            isDeleted: false,
            isActive: true,
        });

        return {
            success: true,
            message:
                'Services fetched successfully.',
            data: services,
        };

    }

    async getByCategory(
        category: string,
    ) {

        const services =
            await this.serviceModel.find({
                category,
                isDeleted: false,
                isActive: true,
            });

        return {
            success: true,
            message:
                'Services fetched successfully.',
            data: services,
        };

    }

    async getPopularServices() {

        const services =
            await this.serviceModel.find({
                isPopular: true,
                isDeleted: false,
                isActive: true,
            });

        return {
            success: true,
            message:
                'Popular services fetched successfully.',
            data: services,
        };

    }

    async searchServices(
        query: GetServicesDto,
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
        };

        if (query.search) {
            filter.name = {
                $regex: query.search,
                $options: 'i',
            };
        }

        if (query.branchId) {
            filter.branchId =
                query.branchId;
        }

        if (query.category) {
            filter.category =
                query.category;
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalServices =
            await this.serviceModel
                .countDocuments(
                    filter,
                );

        const services =
            await this.serviceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('branchId')
                .populate('salonId');

        return {
            success: true,
            message:
                'Services fetched successfully.',
            data: services,
            pagination: {
                total: totalServices,
                page,
                limit,
                totalPages: Math.ceil(
                    totalServices / limit,
                ),
            },
        };

    }

    async getAllByAdmin(
        user: any,
        query: GetServicesDto,
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
            filter.name = {
                $regex: query.search,
                $options: 'i',
            };
        }

        if (query.branchId) {
            filter.branchId =
                query.branchId;
        }

        if (query.category) {
            filter.category =
                query.category;
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalServices =
            await this.serviceModel
                .countDocuments(
                    filter,
                );

        const services =
            await this.serviceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('salonId')
                .populate('branchId');

        return {
            success: true,
            message:
                'Services fetched successfully.',
            data: services,
            pagination: {
                total: totalServices,
                page,
                limit,
                totalPages: Math.ceil(
                    totalServices / limit,
                ),
            },
        };

    }

    async updateServiceStatus(
        user: any,
        id: string,
        dto: UpdateServiceStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const service =
            await this.serviceModel.findById(
                id,
            );

        if (!service) {
            throw new BadRequestException(
                'Service not found.',
            );
        }

        Object.assign(
            service,
            dto,
        );

        await service.save();

        return {
            success: true,
            message:
                'Service status updated successfully.',
            data: service,
        };

    }

    async deleteServiceByAdmin(
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

        const service =
            await this.serviceModel.findById(
                id,
            );

        if (!service) {
            throw new BadRequestException(
                'Service not found.',
            );
        }

        service.isDeleted = true;

        await service.save();

        return {
            success: true,
            message:
                'Service deleted successfully.',
        };

    }

}