import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(
    @Body() body: { email: string; password: string; name?: string },
  ): User {
    if (this.userService.findByEmail(body.email)) {
      throw new BadRequestException('Email already registered');
    }
    return this.userService.createUser(body.email, body.password, body.name);
  }

  @Get(':id')
  getUser(@Param('id') id: string): User {
    const user = this.userService.findById(Number(id));
    if (!user) throw new BadRequestException('User not found');
    return user;
  }
}
