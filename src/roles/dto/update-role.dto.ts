import {
    IsArray,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateRoleDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    permissionIds?: string[];

}