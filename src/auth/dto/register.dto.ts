import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

export class RegisterDto {

    @IsNotEmpty()
    @IsString()
    ownerName: string;

    @IsNotEmpty()
    @IsString()
    salonName: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @MinLength(8)
    password: string;

}