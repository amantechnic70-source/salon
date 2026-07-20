import {
    IsArray,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateRoleDto {

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    permissionIds: string[];

}