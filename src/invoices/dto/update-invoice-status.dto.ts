import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateInvoiceStatusDto {

    @IsOptional()
    @IsString()
    paymentStatus?: string;

    @IsOptional()
    @IsString()
    invoiceStatus?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}