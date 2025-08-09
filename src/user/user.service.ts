import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private users: User[] = [];
  private idCounter = 1;

  createUser(email: string, password: string, name?: string): User {
    const user: User = { id: this.idCounter++, email, password, name };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  findById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}