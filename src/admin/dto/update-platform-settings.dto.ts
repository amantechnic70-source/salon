import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdatePlatformSettingsDto {

    @IsOptional()
    @IsString()
    supportEmail?: string;

    @IsOptional()
    @IsString()
    supportPhone?: string;

    @IsOptional()
    @IsNumber()
    platformCommission?: number;

    @IsOptional()
    @IsBoolean()
    maintenanceMode?: boolean;

}