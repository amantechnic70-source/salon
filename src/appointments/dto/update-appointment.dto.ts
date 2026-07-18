import {
    IsArray,
    IsDateString,
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateAppointmentDto {

    @IsOptional()
    @IsMongoId()
    branchId?: string;

    @IsOptional()
    @IsMongoId()
    customerId?: string;

    @IsOptional()
    @IsMongoId()
    staffId?: string;

    @IsOptional()
    @IsArray()
    serviceIds?: string[];

    @IsOptional()
    @IsDateString()
    appointmentDate?: Date;

    @IsOptional()
    @IsString()
    appointmentTime?: string;

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