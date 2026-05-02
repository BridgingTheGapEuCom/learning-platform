import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Server } from 'http';
import { IncomingHttpHeaders } from 'http';

// Adjust path as needed
import { AppModule } from '../src/app.module';

describe('Auth & Security (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();

    connection = app.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    const collections = connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  it('Full Security Flow: Manual Setup -> Login -> Force Change -> Access', async () => {
    const server = app.getHttpServer() as Server;

    const hashedPassword = await argon2.hash('password');

    if (!connection.db) {
      throw new Error('Database connection failed');
    }

    await connection.db.collection('users').insertOne({
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Test',
      globalRole: 'super_admin',
      mustChangePassword: true,
      organizations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });

    // 2. Login
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' })
      .expect(200);

    interface LoginResponse {
      access_token: string;
      user: unknown;
    }
    const body = loginRes.body as LoginResponse;
    const accessToken = body.access_token;

    const headers = loginRes.headers as IncomingHttpHeaders;
    const setCookie = headers['set-cookie'];

    expect(setCookie).toBeDefined();
    if (!setCookie) throw new Error('No cookies set');

    const refreshTokenCookie = setCookie.find((c) =>
      c.startsWith('refresh_token'),
    );

    if (!refreshTokenCookie) {
      throw new Error('Refresh token cookie missing');
    }

    await request(server)
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test School' })
      .expect(403)
      .expect((res) => {
        const errorBody = res.body as { error: string };
        expect(errorBody.error).toEqual('PasswordChangeRequired');
      });

    await request(server)
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ newPassword: 'newSecurePassword789' })
      .expect(200);

    await request(server)
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test School' })
      .expect(201);

    // A workaround for quick test execution
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const refreshRes = await request(server)
      .post('/auth/refresh')
      .set('Cookie', [refreshTokenCookie])
      .expect(200);

    const refreshBody = refreshRes.body as { access_token: string };
    expect(refreshBody.access_token).toBeDefined();
    expect(refreshBody.access_token).not.toEqual(accessToken);
  });

  it('should set secure cookies (CSRF & XSS protection)', async () => {
    const hashedPassword = await argon2.hash('password');

    if (!connection.db) {
      throw new Error('Database connection failed');
    }

    await connection.db.collection('users').insertOne({
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Test',
      globalRole: 'super_admin',
      mustChangePassword: true,
      organizations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });

    const response = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' }); // Use valid credentials

    const cookies = response.headers['set-cookie'] as unknown as string[];

    expect(cookies).toBeDefined();
    expect(Array.isArray(cookies)).toBeTruthy(); // Optional double-check

    const refreshTokenCookie = cookies.find((c) =>
      c.startsWith('refresh_token'),
    );

    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain('HttpOnly'); // Prevents XSS
    expect(refreshTokenCookie).toContain('Path=/');

    expect(refreshTokenCookie).toContain('SameSite=Lax');
  });
});
