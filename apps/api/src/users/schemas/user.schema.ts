import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '@btg/shared-types';
import { Document, Types } from 'mongoose';

/**
 * A transformation function designed to modify the output of a MongoDB document
 * by removing sensitive or unnecessary fields before sending it to the client.
 *
 * @param {Document} _doc - The original MongoDB document. This parameter is unused in the function but is part of the signature to comply with transformation expectations.
 * @param {Partial<User>} ret - The object representation of the user document after transformation.
 * @returns {Partial<User>} - The modified user object with sensitive or irrelevant fields (e.g., `password`, `__v`, `_id`) removed.
 */
const transformUser = (_doc: Document, ret: Partial<User>): Partial<User> => {
  delete ret.password;
  delete ret.__v;

  if (ret._id) {
    delete ret._id;
  }

  return ret;
};

/**
 * Class representing the Google authentication details for a user.
 */
@Schema({ _id: false })
export class GoogleAuth {
  @Prop({ required: true })
  id: string;

  @Prop()
  accessToken?: string;

  @Prop()
  avatar?: string;
}

/**
 * Represents a user in the application.
 *
 * The User class defines the schema for user-related data, including personal information,
 * authentication details, roles, and organization memberships. It supports transformations
 * for JSON and object representations and includes various properties for interaction with
 * user accounts.
 *
 * @schema
 * - `timestamps: true` - Automatically adds `createdAt` and `updatedAt` fields.
 * - `toJSON: { transform: transformUser, virtuals: true }` - Customizes JSON serialization with transformations and virtual properties.
 * - `toObject: { transform: transformUser, virtuals: true }` - Customizes object conversion with transformations and virtual properties.
 *
 * @extends Document
 *
 * @property {Types.ObjectId} _id - Unique identifier for the user (MongoDB ObjectId).
 * @property {Types.ObjectId} id - Alias for `_id`, typically used for compatibility.
 * @property {number} [__v] - Internal version key used by MongoDB, not selectable in queries.
 * @property {string} email - The email address of the user. Must be unique and is mandatory.
 * @property {string} firstName - The first name of the user. Mandatory field.
 * @property {string} lastName - The last name of the user. Mandatory field.
 * @property {string} [password] - The hashed password for the user. Hidden from query results by default.
 * @property {string} [ssoId] - Optional single sign-on identifier for the user.
 * @property {Types.ObjectId[]} organizations - List of organizations the user is associated with.
 * @property {Role} globalRole - The user's global role in the system. Defaults to `Role.User`.
 * @property {string|null} [hashedRefreshToken] - Optional hashed refresh token for session management. Hidden by default.
 * @property {boolean} mustChangePassword - Flag indicating whether the user must update their password. Defaults to `false`.
 * @property {GoogleAuth} [google] - Google authentication details if the user is authenticated via Google.
 */
@Schema({
  timestamps: true,
  toJSON: {
    transform: transformUser,
    virtuals: true,
  },
  toObject: {
    transform: transformUser,
    virtuals: true,
  },
})
export class User extends Document {
  declare _id: Types.ObjectId;
  declare id: Types.ObjectId;

  @Prop({ select: false })
  __v?: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false })
  displayName?: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ index: true, sparse: true })
  ssoId?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Organization' }] })
  organizations: Types.ObjectId[];

  @Prop({ type: String, enum: Role, default: Role.User })
  globalRole: Role;

  @Prop({ select: false, type: String })
  hashedRefreshToken?: string | null;

  @Prop({ default: false })
  mustChangePassword: boolean;

  @Prop({ type: String, default: 'Active' })
  status: boolean;

  @Prop({ type: GoogleAuth })
  google?: GoogleAuth;
}

export const UserSchema = SchemaFactory.createForClass(User);
