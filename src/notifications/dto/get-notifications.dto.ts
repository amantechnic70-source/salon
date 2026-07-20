import {
    IsOptional,
    IsString,
} from 'class-validator';

export class GetNotificationsDto {

    @IsOptional()
    page?: string = '1';

    @IsOptional()
    limit?: string = '10';

    @IsOptional()
    search?: string;

    @IsOptional()
    sortBy?: string = 'createdAt';

    @IsOptional()
    sortOrder?: string = 'desc';

}