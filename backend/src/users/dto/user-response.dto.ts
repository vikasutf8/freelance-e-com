import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'client@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
  role: UserRole;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
  createdAt: Date;
}
