import {
    IsMongoId,
    IsOptional,
    IsString,
} from 'class-validator';

export class CheckInDto {

    @IsMongoId()
    staffId: string | undefined;

    @IsOptional()
    @IsString()
    remarks?: string;

}
