import {
    IsDateString,
    IsMongoId,
    IsString,
} from 'class-validator';

export class RescheduleBookingDto {

    @IsMongoId()
    appointmentId: string;

    @IsDateString()
    appointmentDate: string;

    @IsString()
    appointmentTime: string;

}