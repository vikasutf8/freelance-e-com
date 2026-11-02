import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserRole } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const maxClients =
      this.configService.get<number>('limits.maxClients') ?? 1000;

    let user: User;

    try {
      user = await this.dataSource.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const clientCount = await manager.count(User, {
            where: { role: UserRole.CLIENT },
          });

          if (clientCount >= maxClients) {
            throw new ForbiddenException('Registrations are closed');
          }

          const newUser = manager.create(User, {
            email,
            password,
            role: UserRole.CLIENT,
          });

          return manager.save(newUser);
        },
      );
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }

    return this.issueToken(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user);
  }

  async me(userId: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.toUserResponse(user);
  }

  private async issueToken(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toUserResponse(user),
    };
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private isDuplicateEmailError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === 'ER_DUP_ENTRY'
    );
  }
}
