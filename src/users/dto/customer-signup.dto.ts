import {
    IsEmail,
    IsString,
    MinLength,
    Matches,
} from 'class-validator';

export class CustomerSignupDto {

    @IsString()
    name: string;


    @IsEmail()
    email: string;


    @IsString()
    @Matches(/^[6-9]\d{9}$/)
    phone: string;


    @IsString()
    @MinLength(8)
    password: string;

}