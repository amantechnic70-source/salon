import {
    IsDateString,
    IsMongoId,
} from 'class-validator';

export class GetAvailableSlotsDto {

    @IsMongoId()
    branchId: string;

    @IsMongoId()
    staffId: string;

    @IsDateString()
    appointmentDate: string;

}