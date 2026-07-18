import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';

export class UpdateProfileDto {

    @IsOptional()
    @IsString()
    name?: string;


    @IsOptional()
    @IsEmail()
    email?: string;


    @IsOptional()
    @Matches(/^[6-9]\d{9}$/)
    phone?: string;


    @IsOptional()
    @IsString()
    profileImage?: string;


    @IsOptional()
    @IsString()
    gender?: string;


    @IsOptional()
    @IsString()
    dateOfBirth?: string;

}