import {
    IsDateString,
    IsString,
} from 'class-validator';

export class RescheduleAppointmentDto {

    @IsDateString()
    appointmentDate: Date;

    @IsString()
    appointmentTime: string;

}