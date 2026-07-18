import {
    IsEmail,
    IsMongoId,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';

export class CreateStaffDto {

    @IsMongoId()
    branchId: string;

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
    profileImage?: string;

    @IsOptional()
    @IsString()
    designation?: string;

    @IsOptional()
    salary?: number;

    @IsOptional()
    commissionPercentage?: number;

    @IsOptional()
    experience?: number;

    @IsOptional()
    joiningDate?: Date;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    description?: string;

}