import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateNotificationStatusDto {

    @IsOptional()
    @IsBoolean()
    isRead?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}