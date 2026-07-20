import {
    IsOptional,
    IsString,
} from 'class-validator';

export class GetPermissionsDto {

    @IsOptional()
    @IsString()
    module?: string;

}