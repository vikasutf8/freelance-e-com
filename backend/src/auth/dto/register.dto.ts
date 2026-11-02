import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'client@example.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    minLength: 8,
    maxLength: 72,
    description: 'Any role sent in the body is ignored; accounts are clients.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
