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

import { ReviewsService } from './reviews.service';

import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';

@Controller('reviews')
export class ReviewsController {

    constructor(
        private readonly reviewsService:
            ReviewsService,
    ) { }


    // CUSTOMER APIs

    @Post('create')
    @UseGuards(JwtAuthGuard)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateReviewDto,
    ) {
        return this.reviewsService.create(
            user.sub,
            dto,
        );
    }


    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(
        @CurrentUser() user: any,
        @Query() query: GetReviewsDto,
    ) {
        return this.reviewsService.getAll(
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
        return this.reviewsService.getById(
            user.sub,
            id,
        );
    }


    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateReviewDto,
    ) {
        return this.reviewsService.update(
            user.sub,
            id,
            dto,
        );
    }


    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    deleteReview(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.reviewsService.deleteReview(
            user.sub,
            id,
        );
    }


    // PUBLIC APIs

    @Get('salon/:id')
    getSalonReviews(
        @Param('id') id: string,
    ) {
        return this.reviewsService.getSalonReviews(
            id,
        );
    }


    @Get('staff/:id')
    getStaffReviews(
        @Param('id') id: string,
    ) {
        return this.reviewsService.getStaffReviews(
            id,
        );
    }


    @Get('service/:id')
    getServiceReviews(
        @Param('id') id: string,
    ) {
        return this.reviewsService.getServiceReviews(
            id,
        );
    }


    @Get('search/all')
    searchReviews(
        @Query() query: GetReviewsDto,
    ) {
        return this.reviewsService.searchReviews(
            query,
        );
    }


    // SUPER ADMIN APIs

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    getAllByAdmin(
        @CurrentUser() user: any,
        @Query() query: GetReviewsDto,
    ) {
        return this.reviewsService.getAllByAdmin(
            user,
            query,
        );
    }


    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard)
    updateReviewStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateReviewStatusDto,
    ) {
        return this.reviewsService.updateReviewStatus(
            user,
            id,
            dto,
        );
    }


    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    deleteReviewByAdmin(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.reviewsService.deleteReviewByAdmin(
            user,
            id,
        );
    }

}