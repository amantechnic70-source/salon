import {
    IsOptional,
    IsString,
} from 'class-validator';

export class GetSalonsDto {

    @IsOptional()
    @IsString()
    page?: string = '1';

    @IsOptional()
    @IsString()
    limit?: string = '10';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    city?: string;

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