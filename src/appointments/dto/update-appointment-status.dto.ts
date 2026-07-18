import {
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateAppointmentStatusDto {

    @IsOptional()
    @IsString()
    appointmentStatus?: string;

    @IsOptional()
    isCompleted?: boolean;

    @IsOptional()
    isCancelled?: boolean;

}