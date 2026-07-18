import {
    IsMongoId,
} from 'class-validator';

export class AssignMembershipDto {

    @IsMongoId()
    customerId: string;

    @IsMongoId()
    membershipPlanId: string;

}