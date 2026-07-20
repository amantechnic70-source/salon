import {
    IsString,
} from 'class-validator';

export class AssignRoleDto {

    @IsString()
    staffId: string;

    @IsString()
    roleId: string;

}