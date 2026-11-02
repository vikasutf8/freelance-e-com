import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    });

    return users.map((user) => this.toResponse(user));
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  async updateRole(
    id: number,
    role: UserRole,
    currentAdminId: number,
  ): Promise<UserResponseDto> {
    await this.findById(id);

    if (id === currentAdminId && role !== UserRole.ADMIN) {
      throw new BadRequestException('You cannot remove your own admin role');
    }

    await this.usersRepository.update(id, { role });

    return this.findById(id);
  }

  async remove(
    id: number,
    currentAdminId: number,
  ): Promise<{ message: string; id: number }> {
    await this.findById(id);

    if (id === currentAdminId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.usersRepository.delete(id);

    return { message: 'User deleted', id };
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
