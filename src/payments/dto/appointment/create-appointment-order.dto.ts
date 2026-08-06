import {
    ArrayNotEmpty,
    IsArray,
    IsDateString,
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateAppointmentOrderDto {

    @IsMongoId()
    salonId:string;

    @IsMongoId()
    branchId:string;

    @IsMongoId()
    staffId:string;

    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({
        each:true,
    })
    serviceIds:string[];

    @IsDateString()
    appointmentDate:string;

    @IsString()
    appointmentTime:string;

    @IsOptional()
    @IsString()
    notes?:string;

}