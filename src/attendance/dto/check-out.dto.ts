import {
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CheckOutDto {

    @IsMongoId()
    attendanceId: string;

    @IsOptional()
    @IsString()
    remarks?: string;

}