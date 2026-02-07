import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import helmet from 'helmet'; // You might need to mock or just run app
import { Server } from 'http';

describe('Security Headers (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Manually apply helmet here because e2e tests don't run main.ts
    app.use(helmet());

    await app.init();
  });

  it('should have Helmet headers', async () => {
    const response = await request(app.getHttpServer() as Server).get('/'); // Any route

    // Helmet hides this
    expect(response.headers['x-powered-by']).toBeUndefined();

    // Helmet adds this
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
  });

  it('should block brute force attempts on login', async () => {
    const email = 'victim@test.com';
    const password = 'wrongpassword';

    // 1. Make 3 allowed requests
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email, password })
        .expect(401); // Unauthorized (Invalid credentials)
    }

    // 2. Make the 4th request (Should be BLOCKED)
    const response = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email, password });

    // 3. Expect 429 Too Many Requests
    expect(response.status).toBe(429);
    expect((response.body as { message: string }).message).toMatch(
      'ThrottlerException: Too Many Requests',
    );
  });
});
