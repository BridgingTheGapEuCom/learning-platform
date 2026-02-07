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
import { CreateSocialUserDto, Role } from '@btg/shared-types';

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
  async onModuleInit() {
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
        global_role: Role.SuperAdmin,
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

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findOneById(id: Types.ObjectId | string): Promise<User | null> {
    if (typeof id === 'string') {
      id = new Types.ObjectId(id);
    }
    return this.userModel.findById(id).exec();
  }

  async findOneByIdWithRefreshToken(
    id: Types.ObjectId | string,
  ): Promise<User | null> {
    if (typeof id === 'string') {
      id = new Types.ObjectId(id);
    }
    return this.userModel.findById(id).select('+hashedRefreshToken').exec();
  }

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

  async update(
    userId: Types.ObjectId,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }

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
