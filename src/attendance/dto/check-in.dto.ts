import {
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CheckInDto {

    @IsMongoId()
    staffId: string;

    @IsOptional()
    @IsString()
    remarks?: string;

}