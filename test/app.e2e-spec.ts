import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
// import { AppModule } from './../src/app.module';
import type { Server } from 'http';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';

interface UserResponse {
  id: string;
  email: string;
  name: string;
  // Add other fields if your user entity has more
}

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let mysql: StartedMySqlContainer;

  beforeAll(async () => {
    mysql = await new MySqlContainer('mysql:8.0')
    .withDatabase('test_db')
    .withUsername('test')
    .withUserPassword('test') // for non-root user
    .withRootPassword('rootpass') // optional
    .start();

    // Set env for TypeORM config
    process.env.DB_HOST = '127.0.0.1';               // safer than localhost
    process.env.DB_PORT = String(mysql.getPort());
    process.env.DB_USER = mysql.getUsername();
    process.env.DB_PASS = mysql.getUserPassword();
    process.env.DB_NAME = mysql.getDatabase();
    process.env.NODE_ENV = 'test';

    const { AppModule } = await import('../src/app.module.js');

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
    await app?.close();
    await mysql?.stop();
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