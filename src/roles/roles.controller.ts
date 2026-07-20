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

import { RolesService } from './roles.service';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';

@Controller('roles')
export class RolesController {

    constructor(
        private readonly rolesService:
            RolesService,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateRoleDto,
    ) {
        return this.rolesService.create(
            user.sub,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetRolesDto,
    ) {
        return this.rolesService.getAll(
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
        return this.rolesService.getById(
            user.sub,
            id,
        );
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateRoleDto,
    ) {
        return this.rolesService.update(
            user.sub,
            id,
            dto,
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    deleteRole(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.rolesService.deleteRole(
            user.sub,
            id,
        );
    }

    @Get('permissions/all')
    @UseGuards(JwtAuthGuard)
    getPermissions(
        @Query() query: GetPermissionsDto,
    ) {
        return this.rolesService.getPermissions(
            query,
        );
    }

    @Post('assign-permissions')
    @UseGuards(JwtAuthGuard)
    assignPermissions(
        @CurrentUser() user: any,
        @Body() dto: AssignPermissionsDto,
    ) {
        return this.rolesService
            .assignPermissions(
                user.sub,
                dto,
            );
    }

    @Post('assign-role')
    @UseGuards(JwtAuthGuard)
    assignRole(
        @CurrentUser() user: any,
        @Body() dto: AssignRoleDto,
    ) {
        return this.rolesService
            .assignRole(
                user.sub,
                dto,
            );
    }

    @Get('my-role/details')
    @UseGuards(JwtAuthGuard)
    getMyRole(
        @CurrentUser() user: any,
    ) {
        return this.rolesService
            .getMyRole(
                user.sub,
            );
    }

    @Get('staff/:id')
    @UseGuards(JwtAuthGuard)
    getStaffRole(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.rolesService
            .getStaffRole(
                user.sub,
                id,
            );
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetRolesDto,
    ) {
        return this.rolesService
            .getAllByAdmin(
                user,
                query,
            );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateRoleStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body()
        dto: UpdateRoleStatusDto,
    ) {
        return this.rolesService
            .updateRoleStatus(
                user,
                id,
                dto,
            );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteRoleByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.rolesService
            .deleteRoleByAdmin(
                user,
                id,
            );
    }

}