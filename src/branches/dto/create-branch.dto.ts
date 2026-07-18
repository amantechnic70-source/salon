import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';

export class CreateBranchDto {

    @IsString()
    name: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @Matches(/^[6-9]\d{9}$/)
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    pincode?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    latitude?: number;

    @IsOptional()
    longitude?: number;

    @IsOptional()
    @IsString()
    openingTime?: string;

    @IsOptional()
    @IsString()
    closingTime?: string;

}