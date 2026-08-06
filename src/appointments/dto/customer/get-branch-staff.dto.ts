import {
    IsMongoId,
} from 'class-validator';

export class GetBranchStaffDto {

    @IsMongoId()
    branchId: string;

}