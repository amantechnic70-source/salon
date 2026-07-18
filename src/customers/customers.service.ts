import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateCustomerStatusDto } from './dto/update-customer-status.dto';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class CustomersService {

    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateCustomerDto,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const totalCustomers =
            await this.customerModel.countDocuments();

        const customerId =
            `CUS${String(
                totalCustomers + 1,
            ).padStart(6, '0')}`;

        const customer =
            await this.customerModel.create({
                customerId,
                salonId: salon._id,
                ...dto,
            });

        return {
            success: true,
            message:
                'Customer created successfully.',
            data: customer,
        };

    }

    async getAll(
        userId: string,
        query: GetCustomersDto,
    ) {

        const salon = await this.salonModel.findOne({
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
            filter.name = {
                $regex: query.search,
                $options: 'i',
            };
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalCustomers =
            await this.customerModel
                .countDocuments(
                    filter,
                );

        const customers =
            await this.customerModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit);

        return {
            success: true,
            message:
                'Customers fetched successfully.',
            data: customers,
            pagination: {
                total: totalCustomers,
                page,
                limit,
                totalPages: Math.ceil(
                    totalCustomers / limit,
                ),
            },
        };

    }

    async getById(
        userId: string,
        id: string,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const customer =
            await this.customerModel.findOne({
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            });

        if (!customer) {
            throw new BadRequestException(
                'Customer not found.',
            );
        }

        return {
            success: true,
            message:
                'Customer fetched successfully.',
            data: customer,
        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateCustomerDto,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const customer =
            await this.customerModel.findOne({
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            });

        if (!customer) {
            throw new BadRequestException(
                'Customer not found.',
            );
        }

        Object.assign(
            customer,
            dto,
        );

        await customer.save();

        return {
            success: true,
            message:
                'Customer updated successfully.',
            data: customer,
        };

    }

    async deleteCustomer(
        userId: string,
        id: string,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const customer =
            await this.customerModel.findOne({
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            });

        if (!customer) {
            throw new BadRequestException(
                'Customer not found.',
            );
        }

        customer.isDeleted = true;

        await customer.save();

        return {
            success: true,
            message:
                'Customer deleted successfully.',
        };

    }

    async getAllByAdmin(
        user: any,
        query: GetCustomersDto,
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

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalCustomers =
            await this.customerModel
                .countDocuments(
                    filter,
                );

        const customers =
            await this.customerModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('salonId');

        return {
            success: true,
            message:
                'Customers fetched successfully.',
            data: customers,
            pagination: {
                total: totalCustomers,
                page,
                limit,
                totalPages: Math.ceil(
                    totalCustomers / limit,
                ),
            },
        };

    }

    async updateCustomerStatus(
        user: any,
        id: string,
        dto: UpdateCustomerStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const customer =
            await this.customerModel.findById(
                id,
            );

        if (!customer) {
            throw new BadRequestException(
                'Customer not found.',
            );
        }

        Object.assign(
            customer,
            dto,
        );

        await customer.save();

        return {
            success: true,
            message:
                'Customer status updated successfully.',
            data: customer,
        };

    }

    async deleteCustomerByAdmin(
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

        const customer =
            await this.customerModel.findById(
                id,
            );

        if (!customer) {
            throw new BadRequestException(
                'Customer not found.',
            );
        }

        customer.isDeleted = true;

        await customer.save();

        return {
            success: true,
            message:
                'Customer deleted successfully.',
        };

    }

}