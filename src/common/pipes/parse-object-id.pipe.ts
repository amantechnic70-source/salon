import {
    PipeTransform,
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import mongoose from 'mongoose';

@Injectable()
export class ParseObjectIdPipe
    implements PipeTransform {

    transform(value: string) {

        if (
            !mongoose.Types.ObjectId
                .isValid(value)
        ) {

            throw new BadRequestException(
                'Invalid ObjectId',
            );

        }

        return value;
    }

}