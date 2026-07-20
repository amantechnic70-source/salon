import {
    IsEmail,
    IsString,
    Length,
} from 'class-validator';

export class VerifyAdminOtpDto {

    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    otp: string;

}