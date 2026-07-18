import {
    IsOptional,
    IsString,
    IsNumberString,
} from 'class-validator';

export class GetUsersDto {

    @IsOptional()
    @IsNumberString()
    page?: string = '1';


    @IsOptional()
    @IsNumberString()
    limit?: string = '10';


    @IsOptional()
    @IsString()
    search?: string;


    @IsOptional()
    @IsString()
    role?: string;


    @IsOptional()
    @IsString()
    isActive?: string;


    @IsOptional()
    @IsString()
    isVerified?: string;


    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';


    @IsOptional()
    @IsString()
    sortOrder?: string = 'desc';

}