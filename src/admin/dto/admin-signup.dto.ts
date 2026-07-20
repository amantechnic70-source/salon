import {
    IsEmail,
    IsString,
    MinLength,
    Matches,
} from 'class-validator';

export class AdminSignupDto {

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @Matches(
        /^[6-9]\d{9}$/,
    )
    phone: string;

    @MinLength(8)
    password: string;

}