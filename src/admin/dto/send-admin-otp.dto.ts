import {
    IsEmail,
} from 'class-validator';

export class SendAdminOtpDto {

    @IsEmail()
    email: string;

}