import {
    IsOptional,
} from 'class-validator';

export class GetRolesDto {

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsOptional()
    search?: string;

}