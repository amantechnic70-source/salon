import {
    IsMongoId,
} from 'class-validator';

export class SelectPlanDto {

    @IsMongoId()
    planId: string;

}