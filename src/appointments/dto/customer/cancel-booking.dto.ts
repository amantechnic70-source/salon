import {
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CancelBookingDto {

    @IsMongoId()
    appointmentId: string;

    @IsOptional()
    @IsString()
    reason?: string;

}