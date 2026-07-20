import {
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import {
    Document,
    Types,
} from 'mongoose';

export type RoleDocument =
    Role & Document;

@Schema({
    timestamps: true,
})
export class Role {

    @Prop({
        required: true,
        unique: true,
    })
    roleId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Salon',
        required: true,
    })
    salonId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Branch',
    })
    branchId: Types.ObjectId;

    @Prop({
        required: true,
    })
    name: string;

    @Prop()
    description: string;

    @Prop([
        {
            type: Types.ObjectId,
            ref: 'Permission',
        },
    ])
    permissionIds: Types.ObjectId[];

    @Prop({
        default: false,
    })
    isDefault: boolean;

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isDeleted: boolean;

}

export const RoleSchema =
    SchemaFactory.createForClass(
        Role,
    );