import {
    IsOptional,
    IsString,
} from 'class-validator';

export class GetMembershipPlansDto {

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
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString()
    sortOrder?: string = 'desc';

}