import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import {
    Document,
} from 'mongoose';

export type PermissionDocument =
    Permission &
    Document;

@Schema({
    timestamps: true,
})
export class Permission {

    @Prop({
        required: true,
        unique: true,
    })
    permissionId: string;

    @Prop({
        required: true,
    })
    name: string;

    @Prop({
        required: true,
    })
    module: string;

    @Prop()
    description: string;

    @Prop({
        default: true,
    })
    isActive: boolean;

}

export const PermissionSchema =
    SchemaFactory.createForClass(
        Permission,
    );