import {
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateNotificationDto {

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    referenceId?: string;

    @IsOptional()
    @IsString()
    referenceType?: string;

}