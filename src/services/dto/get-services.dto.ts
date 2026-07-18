import {
    IsOptional,
    IsString,
} from 'class-validator';

export class GetServicesDto {

    @IsOptional()
    page?: string = '1';

    @IsOptional()
    limit?: string = '10';

    @IsOptional()
    search?: string;

    @IsOptional()
    branchId?: string;

    @IsOptional()
    category?: string;

    @IsOptional()
    sortBy?: string = 'createdAt';

    @IsOptional()
    sortOrder?: string = 'desc';

}