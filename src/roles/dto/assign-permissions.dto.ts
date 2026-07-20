import {
    IsArray,
    IsString,
} from 'class-validator';

export class AssignPermissionsDto {

    @IsString()
    roleId: string;

    @IsArray()
    permissionIds: string[];

}