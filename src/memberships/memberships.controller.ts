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

import { MembershipsService } from './memberships.service';

import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { GetMembershipPlansDto } from './dto/get-membership-plans.dto';
import { AssignMembershipDto } from './dto/assign-membership.dto';
import { UpdateMembershipStatusDto } from './dto/update-membership-status.dto';

@Controller('memberships')
export class MembershipsController {

    constructor(
        private readonly membershipsService:
            MembershipsService,
    ) { }

    // SALON OWNER APIs

    @Post('plans/create')
    @UseGuards(JwtAuthGuard)
    createPlan(
        @CurrentUser() user: any,
        @Body() dto: CreateMembershipPlanDto,
    ) {
        return this.membershipsService.createPlan(
            user.sub,
            dto,
        );
    }

    @Get('plans')
    @UseGuards(JwtAuthGuard)
    getPlans(
        @CurrentUser() user: any,
        @Query() query: GetMembershipPlansDto,
    ) {
        return this.membershipsService.getPlans(
            user.sub,
            query,
        );
    }

    @Patch('plans/:id')
    @UseGuards(JwtAuthGuard)
    updatePlan(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateMembershipPlanDto,
    ) {
        return this.membershipsService.updatePlan(
            user.sub,
            id,
            dto,
        );
    }

    @Delete('plans/:id')
    @UseGuards(JwtAuthGuard)
    deletePlan(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.membershipsService.deletePlan(
            user.sub,
            id,
        );
    }


    // CUSTOMER MEMBERSHIP APIs

    @Post('assign')
    @UseGuards(JwtAuthGuard)
    assignMembership(
        @CurrentUser() user: any,
        @Body() dto: AssignMembershipDto,
    ) {
        return this.membershipsService.assignMembership(
            user.sub,
            dto,
        );
    }

    @Get('customer/:customerId')
    @UseGuards(JwtAuthGuard)
    getCustomerMembership(
        @CurrentUser() user: any,
        @Param('customerId')
        customerId: string,
    ) {
        return this.membershipsService
            .getCustomerMembership(
                user.sub,
                customerId,
            );
    }


    // PUBLIC APIs

    @Get('search')
    searchMemberships(
        @Query()
        query: GetMembershipPlansDto,
    ) {
        return this.membershipsService
            .searchMemberships(
                query,
            );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query()
        query: GetMembershipPlansDto,
    ) {
        return this.membershipsService
            .getAllByAdmin(
                user,
                query,
            );
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateMembershipStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body()
        dto: UpdateMembershipStatusDto,
    ) {
        return this.membershipsService
            .updateMembershipStatus(
                user,
                id,
                dto,
            );
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteMembershipByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.membershipsService
            .deleteMembershipByAdmin(
                user,
                id,
            );
    }

}