import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = { id: 1, email: 'test@example.com', password: 'pass', name: 'Test' } as User;
    jest.spyOn(repo, 'create').mockReturnValue(user);
    jest.spyOn(repo, 'save').mockResolvedValue(user);

    expect(await service.createUser(user.email, user.password, user.name)).toEqual(user);
  });

  it('should find user by email', async () => {
    const user = { id: 1, email: 'test@example.com', password: 'pass', name: 'Test' } as User;
    jest.spyOn(repo, 'findOne').mockResolvedValue(user);

    expect(await service.findByEmail(user.email)).toEqual(user);
  });

  it('should find user by id', async () => {
    const user = { id: 1, email: 'test@example.com', password: 'pass', name: 'Test' } as User;
    jest.spyOn(repo, 'findOne').mockResolvedValue(user);

    expect(await service.findById(user.id)).toEqual(user);
  });
});