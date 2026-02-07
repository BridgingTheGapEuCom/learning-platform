import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(
    email: string,
    name: string,
    temporaryPassword: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to the Bridging The Gap Learning Platform',
      template: 'welcome',
      context: {
        name,
        temporaryPassword,
      },
    });
  }
}
