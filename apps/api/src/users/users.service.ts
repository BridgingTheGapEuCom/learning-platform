import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, GoogleAuth } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Role } from '@btg/shared-types';
import { CreateSocialUserDto } from 'src/auth/dto/create-social-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  /**
   * Lifecycle method invoked after the module's dependencies are initialized.
   * This method seeds the initial admin user into the system if not already present.
   *
   * @return {Promise<void>} A promise that resolves when the seeding process is complete.
   */
  async onModuleInit(): Promise<void> {
    await this.seedInitialAdmin();
  }

  /**
   * Seeds an initial Super Admin user in the database if no users are present.
   * This method checks for the existence of users in the database. If none are found,
   * it creates a new Super Admin with an auto-generated password, logging important
   * credentials for immediate use. This password is not stored and must be copied
   * at the time of logging.
   *
   * @return {Promise<void>} A promise that resolves when the seeding operation is complete.
   */
  private async seedInitialAdmin(): Promise<void> {
    const count = await this.userModel.countDocuments().exec();

    const email =
      this.configService.get<string>('INITIAL_ADMIN_EMAIL') ||
      'admin@bridgingthegap.eu.com';

    const admin = await this.userModel.findOne({ email: email }).exec();

    if (count === 0 || !admin) {
      this.logger.log('Database is empty. Seeding initial Super Admin...');

      const firstName = 'System';
      const lastName = 'Admin';

      const temporaryPassword = crypto.randomBytes(12).toString('hex');
      const hashedPassword = await argon2.hash(temporaryPassword);

      const admin = new this.userModel({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        globalRole: Role.SuperAdmin,
        mustChangePassword: true,
        organizations: [],
      });

      await admin.save();

      this.showAdminUserDetailsInLogs(email, temporaryPassword);
    } else {
      if (admin.mustChangePassword) {
        const temporaryPassword = crypto.randomBytes(12).toString('hex');
        const hashedPassword = await argon2.hash(temporaryPassword);

        await this.userModel.findByIdAndUpdate(admin._id, {
          password: hashedPassword,
        });

        this.showAdminUserDetailsInLogs(email, temporaryPassword);
      }
    }
  }

  /**
   * Logs the details of a newly created admin user, including their email and temporary password.
   * This method outputs logs marked specifically for a super admin user, emphasizing the confidentiality and urgency of copying the password.
   *
   * @param {string} email - The email address of the admin user being logged.
   * @param {string} temporaryPassword - The temporary password generated for the admin user. It is not stored anywhere and must be copied immediately.
   * @return {void} - This method does not return a value.
   */
  private showAdminUserDetailsInLogs(
    email: string,
    temporaryPassword: string,
  ): void {
    this.logger.log(
      '==========================================================',
    );
    this.logger.log('SUPER ADMIN CREATED 🚨');
    this.logger.log(`Email:    ${email}`);
    this.logger.log(`Password: ${temporaryPassword}`);
    this.logger.log('Copy this password now! It is not stored anywhere.');
    this.logger.log(
      '==========================================================',
    );
  }

  /**
   * Creates a new user with the provided data and saves it to the database.
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing user details including the password.
   * @return {Promise<User>} A promise that resolves to the newly created user.
   * @throws {ConflictException} If a user with the same unique details already exists in the database.
   * @throws {Error} If an unexpected error occurs during creation.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await argon2.hash(createUserDto.password);

      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      return await createdUser.save();
    } catch (error) {
      if (error && (error as { code: number }).code === 11000) {
        throw new ConflictException(
          'Organization with this name already exists',
        );
      }
      throw error;
    }
  }

  /**
   * Creates a new user account using social login details.
   *
   * @param {CreateSocialUserDto} socialDto - Data transfer object containing social login details such as email, name, and Google-specific information.
   * @return {Promise<User>} A promise that resolves to the newly created user.
   */
  async createSocialUser(socialDto: CreateSocialUserDto): Promise<User> {
    const newUser = new this.userModel({
      email: socialDto.email,
      firstName: socialDto.firstName,
      lastName: socialDto.lastName,
      google: socialDto.google,
      role: Role.User,
    });
    return newUser.save();
  }

  /**
   * Retrieves all user records from the database.
   *
   * @return {Promise<User[]>} A promise that resolves to an array containing all users.
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * Finds a single user based on their email address.
   *
   * @param {string} email - The email address of the user to retrieve.
   * @return {Promise<User | null>} A promise that resolves to the user document if found, or null if no user exists with the given email.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Finds a user by email and explicitly includes the password field in the result.
   * This is typically used for authentication logic where the password is excluded from default queries.
   *
   * @param {string} email - The email address of the user.
   * @return {Promise<User | null>} A promise that resolves to the user document with the password field included, or null if not found.
   */
  async findUserWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  /**
   * Finds a user by their unique identifier.
   * Handles both string and ObjectId formats for the ID parameter.
   *
   * @param {Types.ObjectId | string} id - The unique ID of the user.
   * @return {Promise<User | null>} A promise that resolves to the user document if found, or null if the user does not exist.
   */
  async findOneById(id: Types.ObjectId | string): Promise<User | null> {
    if (typeof id === 'string') {
      id = new Types.ObjectId(id);
    }
    return this.userModel.findById(id).exec();
  }

  /**
   * Finds a user by their unique identifier and explicitly includes the hashed refresh token.
   * Handles both string and ObjectId formats for the ID parameter.
   *
   * @param {Types.ObjectId | string} id - The unique ID of the user.
   * @return {Promise<User | null>} A promise that resolves to the user document including the hashedRefreshToken, or null if not found.
   */
  async findOneByIdWithRefreshToken(
    id: Types.ObjectId | string,
  ): Promise<User | null> {
    if (typeof id === 'string') {
      id = new Types.ObjectId(id);
    }
    return this.userModel.findById(id).select('+hashedRefreshToken').exec();
  }

  /**
   * Adds an organization to a user's list of organizations.
   * Uses the $addToSet operator to prevent the addition of duplicate organization IDs.
   *
   * @param {Types.ObjectId} userId - The unique ID of the user to update.
   * @param {Types.ObjectId} orgId - The ID of the organization to add to the user's list.
   * @return {Promise<User | null>} A promise that resolves to the updated user document, or null if the user was not found.
   */
  async addOrganization(
    userId: Types.ObjectId,
    orgId: Types.ObjectId,
  ): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { organizations: orgId } }, // $addToSet prevents duplicates
        { new: true },
      )
      .exec();
  }

  /**
   * Updates an existing user document with partial data.
   *
   * @param {Types.ObjectId} userId - The unique ID of the user to update.
   * @param {Partial<User>} updateData - An object containing the user fields to be updated.
   * @return {Promise<User | null>} A promise that resolves to the updated user document, or null if the user was not found.
   */
  async update(
    userId: Types.ObjectId,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { returnDocument: 'after' })
      .exec();
  }

  /**
   * Updates the Google authentication details for a specific user.
   *
   * @param {string} userId - The string representation of the user's unique ID.
   * @param {GoogleAuth} googleData - The object containing Google OAuth information to persist.
   * @return {Promise<User | null>} A promise that resolves to the updated user document.
   */
  async updateGoogleAuth(userId: string, googleData: GoogleAuth) {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          google: googleData,
        },
      },
      { new: true },
    );
  }
}
