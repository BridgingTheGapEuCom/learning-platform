import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { OrganizationRole } from '@btg/shared-types';

@Schema({ _id: false })
export class OrganizationMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, enum: ['owner', 'admin', 'member'], default: 'member' })
  role: string;

  @Prop({ default: Date.now })
  joinedAt: Date;
}

@Schema({ timestamps: true })
export class Organization extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User | Types.ObjectId;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: [
            OrganizationRole.ADMIN,
            OrganizationRole.TEACHER,
            OrganizationRole.STUDENT,
          ],
          default: OrganizationRole.STUDENT,
        },
        joinedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    default: [],
  })
  members: OrganizationMember[];

  @Prop({ default: 'active' })
  status: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
