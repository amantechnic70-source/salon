import {
    IsArray,
    IsDateString,
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateAppointmentDto {

    @IsMongoId()
    branchId: string;

    @IsMongoId()
    customerId: string;

    @IsMongoId()
    staffId: string;

    @IsArray()
    serviceIds: string[];

    @IsDateString()
    appointmentDate: Date;

    @IsString()
    appointmentTime: string;

    @IsOptional()
    @IsMongoId()
    membershipId?: string;

    @IsOptional()
    @IsMongoId()
    couponId?: string;

    @IsOptional()
    @IsString()
    notes?: string;

}