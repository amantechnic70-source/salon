import {
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateInvoiceDto {

    @IsMongoId()
    appointmentId: string;

    @IsOptional()
    @IsString()
    remarks?: string;

}