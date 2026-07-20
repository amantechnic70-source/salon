import {
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class CreateReviewDto {

    @IsMongoId()
    appointmentId: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    review?: string;

}