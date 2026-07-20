import {
    IsBoolean,
} from 'class-validator';

export class MarkAsReadDto {

    @IsBoolean()
    isRead: boolean;

}