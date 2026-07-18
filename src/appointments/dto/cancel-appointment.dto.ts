import {
    IsString,
} from 'class-validator';

export class CancelAppointmentDto {

    @IsString()
    reason: string;

}