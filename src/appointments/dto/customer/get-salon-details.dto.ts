import {
    IsMongoId,
} from 'class-validator';

export class GetSalonDetailsDto {

    @IsMongoId()
    salonId: string;

}