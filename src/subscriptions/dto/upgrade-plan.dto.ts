import {
    IsMongoId,
} from 'class-validator';

export class UpgradePlanDto {

    @IsMongoId()
    planId: string;

}