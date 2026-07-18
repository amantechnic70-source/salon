import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Param,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SelectPlanDto } from './dto/select-plan.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { SubscriptionService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionController {

    constructor(
        private readonly subscriptionService:
            SubscriptionService,
    ) { }

    // PUBLIC

    @Get('plans')
    getPlans() {
        return this.subscriptionService.getPlans();
    }

    // SALON OWNER

    @Post('select-plan')
    @UseGuards(JwtAuthGuard)
    selectPlan(
        @CurrentUser() user: any,
        @Body() dto: SelectPlanDto,
    ) {
        return this.subscriptionService.selectPlan(
            user.sub,
            dto,
        );
    }

    @Get('current-plan')
    @UseGuards(JwtAuthGuard)
    currentPlan(
        @CurrentUser() user: any,
    ) {
        return this.subscriptionService.currentPlan(
            user.sub,
        );
    }

    @Post('upgrade-plan')
    @UseGuards(JwtAuthGuard)
    upgradePlan(
        @CurrentUser() user: any,
        @Body() dto: UpgradePlanDto,
    ) {
        return this.subscriptionService.upgradePlan(
            user.sub,
            dto,
        );
    }

    // SUPER ADMIN

    @Post('create-plan')
    @UseGuards(JwtAuthGuard)
    createPlan(
        @CurrentUser() user: any,
        @Body() dto: CreatePlanDto,
    ) {
        return this.subscriptionService.createPlan(
            user,
            dto,
        );
    }

    @Patch('update-plan/:id')
    @UseGuards(JwtAuthGuard)
    updatePlan(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdatePlanDto,
    ) {
        return this.subscriptionService.updatePlan(
            user,
            id,
            dto,
        );
    }

    @Delete('delete-plan/:id')
    @UseGuards(JwtAuthGuard)
    deletePlan(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.subscriptionService.deletePlan(
            user,
            id,
        );
    }

}