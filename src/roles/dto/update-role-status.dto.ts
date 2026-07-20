import {
    IsBoolean,
} from 'class-validator';

export class UpdateRoleStatusDto {

    @IsBoolean()
    isActive: boolean;

}