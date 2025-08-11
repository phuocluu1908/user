import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import type { Server } from 'http';

interface UserResponse {
  id: string;
  email: string;
  name: string;
  // Add other fields if your user entity has more
}

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a user', async () => {
    const res = await request(app.getHttpServer() as unknown as Server)
      .post('/users/register')
      .send({ email: 'e2e@example.com', password: 'pass', name: 'E2E' })
      .expect(201);

    const user: UserResponse = res.body as UserResponse;

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('e2e@example.com');
  });

  it('should get a user by id', async () => {
    // First, register a user
    const registerRes = await request(app.getHttpServer() as unknown as Server)
      .post('/users/register')
      .send({ email: 'e2e2@example.com', password: 'pass', name: 'E2E2' })
      .expect(201);

    const registeredUser: UserResponse = registerRes.body as UserResponse;
    const userId = registeredUser.id;

    // Then, get the user
    const getRes = await request(app.getHttpServer() as unknown as Server)
      .get(`/users/${userId}`)
      .expect(200);

    const user: UserResponse = getRes.body as UserResponse;
    expect(user).toHaveProperty('id', userId);
    expect(user.email).toBe('e2e2@example.com');
  });
});