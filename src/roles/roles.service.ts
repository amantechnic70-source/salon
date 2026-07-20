import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/schemas/role.schema';
import { Model, Types } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { generateRoleId } from 'src/common/utils/generate-role-id';
import { Permission, PermissionDocument } from 'src/schemas/permission.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class RolesService {

    constructor(
        @InjectModel(Role.name)
        private readonly roleModel:
            Model<RoleDocument>,

        @InjectModel(Permission.name)
        private readonly permissionModel:
            Model<PermissionDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateRoleDto,
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

        const roleExists =
            await this.roleModel.findOne({

                salonId: salon._id,

                name: dto.name,

                isDeleted: false,

            });

        if (roleExists) {

            throw new BadRequestException(
                'Role already exists.',
            );

        }

        const role =
            await this.roleModel.create({

                roleId:
                    generateRoleId(),

                salonId:
                    salon._id,

                name:
                    dto.name.trim(),

                description:
                    dto.description,

                permissionIds:
                    dto.permissionIds.map(
                        permission =>
                            new Types.ObjectId(
                                permission,
                            ),
                    ),

                isActive:
                    true,

            });

        return {

            success: true,

            message:
                'Role created successfully.',

            data:
                role,

        };

    }

    async getAll(
        userId: string,
        query: GetRolesDto,
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

            filter.name = {

                $regex:
                    query.search,

                $options:
                    'i',

            };

        }

        const roles =
            await this.roleModel

                .find(filter)

                .populate(
                    'permissionIds',
                )

                .skip(skip)

                .limit(limit)

                .sort({

                    createdAt: -1,

                });

        const total =
            await this.roleModel
                .countDocuments(
                    filter,
                );

        return {

            success: true,

            message:
                'Roles fetched successfully.',

            data: {

                page,

                limit,

                total,

                roles,

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

        const role =
            await this.roleModel

                .findOne({

                    _id: id,

                    salonId: salon._id,

                    isDeleted: false,

                })

                .populate(
                    'permissionIds',
                );

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
            );

        }

        return {

            success: true,

            message:
                'Role fetched successfully.',

            data: role,

        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateRoleDto,
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

        const role =
            await this.roleModel.findOne({

                _id: id,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
            );

        }

        if (dto.name) {

            const roleExists =
                await this.roleModel.findOne({

                    salonId: salon._id,

                    name: dto.name,

                    _id: {

                        $ne: id,

                    },

                    isDeleted: false,

                });

            if (roleExists) {

                throw new BadRequestException(
                    'Role name already exists.',
                );

            }

            role.name =
                dto.name.trim();

        }

        if (dto.description) {

            role.description =
                dto.description;

        }

        if (dto.permissionIds) {

            role.permissionIds =
                dto.permissionIds.map(

                    permissionId =>

                        new Types.ObjectId(
                            permissionId,
                        ),

                );

        }

        await role.save();

        return {

            success: true,

            message:
                'Role updated successfully.',

            data: role,

        };

    }

    async deleteRole(
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

        const role =
            await this.roleModel.findOne({

                _id: id,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
            );

        }

        if (role.isDefault) {

            throw new BadRequestException(
                'Default roles cannot be deleted.',
            );

        }

        role.isDeleted = true;

        role.isActive = false;

        await role.save();

        return {

            success: true,

            message:
                'Role deleted successfully.',

            data: role,

        };

    }

    async getPermissions(
        query: GetPermissionsDto,
    ) {

        const filter: any = {

            isActive: true,

        };

        if (query.module) {

            filter.module = {

                $regex: query.module,

                $options: 'i',

            };

        }

        const permissions =
            await this.permissionModel

                .find(filter)

                .sort({

                    module: 1,

                    name: 1,

                });

        return {

            success: true,

            message:
                'Permissions fetched successfully.',

            data: permissions,

        };

    }

    async assignPermissions(
        userId: string,
        dto: AssignPermissionsDto,
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

        const role =
            await this.roleModel.findOne({

                _id: dto.roleId,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
            );

        }

        const permissions =
            await this.permissionModel.find({

                _id: {

                    $in:
                        dto.permissionIds,

                },

            });

        if (

            permissions.length !==
            dto.permissionIds.length

        ) {

            throw new BadRequestException(
                'Invalid permission ids.',
            );

        }

        role.permissionIds =
            dto.permissionIds.map(

                permissionId =>

                    new Types.ObjectId(
                        permissionId,
                    ),

            );

        await role.save();

        return {

            success: true,

            message:
                'Permissions assigned successfully.',

            data: role,

        };

    }

    async assignRole(
        userId: string,
        dto: AssignRoleDto,
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

        const role =
            await this.roleModel.findOne({

                _id: dto.roleId,

                salonId: salon._id,

                isDeleted: false,

                isActive: true,

            });

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
            );

        }

        const staff =
            await this.staffModel.findOne({

                _id: dto.staffId,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!staff) {

            throw new BadRequestException(
                'Staff not found.',
            );

        }

        staff.roleId =
            role._id as Types.ObjectId;

        await staff.save();

        return {

            success: true,

            message:
                'Role assigned successfully.',

            data: {

                staffId:
                    staff._id,

                roleId:
                    role._id,

            },

        };

    }

    async getMyRole(
        userId: string,
    ) {

        const staff =
            await this.staffModel

                .findOne({

                    _id: userId,

                    isDeleted: false,

                })

                .populate({

                    path: 'roleId',

                    populate: {

                        path: 'permissionIds',

                    },

                });

        if (!staff) {

            throw new BadRequestException(
                'Staff not found.',
            );

        }

        if (!staff.roleId) {

            throw new BadRequestException(
                'Role not assigned.',
            );

        }

        return {

            success: true,

            message:
                'Role fetched successfully.',

            data: staff.roleId,

        };

    }

    async getStaffRole(
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
            await this.staffModel

                .findOne({

                    _id: staffId,

                    salonId: salon._id,

                    isDeleted: false,

                })

                .populate({

                    path: 'roleId',

                    populate: {

                        path: 'permissionIds',

                    },

                });

        if (!staff) {

            throw new BadRequestException(
                'Staff not found.',
            );

        }

        return {

            success: true,

            message:
                'Staff role fetched successfully.',

            data: {

                staff,

                role:
                    staff.roleId,

            },

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetRolesDto,
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

        const filter: any = {

            isDeleted: false,

        };

        if (query.search) {

            filter.name = {

                $regex:
                    query.search,

                $options:
                    'i',

            };

        }

        const roles =
            await this.roleModel

                .find(filter)

                .populate('salonId')

                .populate(
                    'permissionIds',
                )

                .skip(skip)

                .limit(limit)

                .sort({

                    createdAt: -1,

                });

        const total =
            await this.roleModel
                .countDocuments(
                    filter,
                );

        return {

            success: true,

            message:
                'Roles fetched successfully.',

            data: {

                page,

                limit,

                total,

                roles,

            },

        };

    }

    async updateRoleStatus(
        user: any,
        id: string,
        dto: UpdateRoleStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const role =
            await this.roleModel.findOne({

                _id: id,

                isDeleted: false,

            });

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
            );

        }

        role.isActive =
            dto.isActive;

        await role.save();

        return {

            success: true,

            message:
                `Role ${dto.isActive
                    ? 'activated'
                    : 'deactivated'
                } successfully.`,

            data: role,

        };

    }

    async deleteRoleByAdmin(
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

        const role =
            await this.roleModel.findOne({

                _id: id,

                isDeleted: false,

            });

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
            );

        }

        if (role.isDefault) {

            throw new BadRequestException(
                'Default roles cannot be deleted.',
            );

        }

        role.isDeleted = true;

        role.isActive = false;

        await role.save();

        return {

            success: true,

            message:
                'Role deleted successfully.',

            data: role,

        };

    }

}