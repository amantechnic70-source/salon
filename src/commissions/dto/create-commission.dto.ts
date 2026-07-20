import {
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateCommissionDto {

    @IsMongoId()
    appointmentId: string;

    @IsMongoId()
    serviceId: string;

    @IsMongoId()
    invoiceId: string;

    @IsNumber()
    commissionPercentage: number;

    @IsOptional()
    @IsString()
    remarks?: string;

}