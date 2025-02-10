import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { TestAppModule } from '../app.module.spec';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { ROLE_NAMES } from '../constants/users';

describe('AuthController', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await userRepository.clear();
    await app.close();
  });

  const testUser = {
    firstName: 'TestFirstName',
    secondName: 'TestSecondName',
    nickName: 'testNickName',
    email: 'test@gmail.com',
    password: 'test_password',
  };

  const minBoundaryLineTokenLength: number = 100;
  const validRoles = Object.values(ROLE_NAMES);

  let accessToken: string;
  let refreshToken: string;

  it('should register a user', async () => {
    const response = await supertest(app.getHttpServer())
      .post('/auth/sign-up')
      .send(testUser)
      .expect(201);

    const resBody: {
      access_token: string;
      refresh_token: string;
    } = response.body;

    expect(resBody).toHaveProperty('access_token');
    expect(resBody).toHaveProperty('refresh_token');

    expect(resBody.access_token.length).toBeGreaterThan(minBoundaryLineTokenLength);
    expect(resBody.refresh_token.length).toBeGreaterThan(minBoundaryLineTokenLength);

  });

  it('should login a user', async () => {
    const response = await supertest(app.getHttpServer())
      .post('/auth/sign-in')
      .send(testUser)
      .expect(201);

    const resBody: {
      name: string;
      role: string;
      access_token: string;
      refresh_token: string;
    } = response.body;

    accessToken = resBody.access_token;
    refreshToken = resBody.refresh_token;

    expect(resBody).toHaveProperty('name');
    expect(resBody).toHaveProperty('role');
    expect(resBody).toHaveProperty('access_token');
    expect(resBody).toHaveProperty('refresh_token');

    expect(resBody.name).toEqual(testUser.nickName);
    expect(validRoles).toContain(resBody.role);
    expect(resBody.access_token.length).toBeGreaterThan(minBoundaryLineTokenLength);
    expect(resBody.refresh_token.length).toBeGreaterThan(minBoundaryLineTokenLength);
  });

  describe('/auth/refresh (POST)', () => {
    it('should return new access and refresh tokens', async () => {
      const response = await supertest(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body.access_token.length).toBeGreaterThan(0);
      expect(response.body.refresh_token.length).toBeGreaterThan(0);
    });
  });

  describe('/users/:userId/role/:roleId (PUT)', () => {
    it('should set role for user', async () => {
      const response = await supertest(app.getHttpServer())
        .put('/users/4/role/2')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Request-Type', 'isTest');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
    });
  });
});
