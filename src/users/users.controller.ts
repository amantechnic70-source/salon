import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { SalonSignupDto } from './dto/salon-signup.dto';
import { UpdateProfileDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller("users")
export class UsersController {

    constructor(

        private readonly usersService: UsersService,

    ) { }


    // OTP APIs

    @Post("send-otp")
    sendOTP(
        @Body() dto: SendOtpDto,
    ) {
        return this.usersService.sendOTP(dto);
    }


    @Post("verify-otp")
    verifyOTP(
        @Body() dto: VerifyOtpDto,
    ) {
        return this.usersService.verifyOTP(dto);
    }


    // CUSTOMER SIGNUP
    @Post("customer-signup")
    customerSignup(
        @Body() dto: CustomerSignupDto,
    ) {
        return this.usersService.customerSignup(dto);
    }


    // SALON OWNER SIGNUP

    @Post("salon-signup")
    salonSignup(
        @Body() dto: SalonSignupDto,
    ) {
        return this.usersService.salonSignup(dto);
    }


    // PROFILE


    @UseGuards(JwtAuthGuard)
    @Get("profile")
    profile(
        @CurrentUser() user,
    ) {

        return this.usersService.profile(
            user.sub,
        );

    }


    // UPDATE PROFILE

    @UseGuards(JwtAuthGuard)
    @Patch("update-profile")
    updateProfile(
        @CurrentUser() user,
        @Body() dto: UpdateProfileDto,
    ) {

        return this.usersService.updateProfile(
            user,
            dto,

        );

    }


    // DELETE ACCOUNT
    @UseGuards(JwtAuthGuard)
    @Delete("delete-account")
    deleteAccount(
        @CurrentUser() user,
    ) {
        return this.usersService.deleteAccount(
            user.sub,
        );

    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAllUsers(
        @CurrentUser() user: any,
        @Query() query: GetUsersDto,
    ) {
        return this.usersService.getAllUsers(
            user,
            query,
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getUserById(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.usersService.getUserById(
            user,
            id,
        );
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    updateUserStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateUserStatusDto,
    ) {
        return this.usersService.updateUserStatus(
            user,
            id,
            dto,
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    deleteUser(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.usersService.deleteUser(
            user,
            id,
        );
    }


}
