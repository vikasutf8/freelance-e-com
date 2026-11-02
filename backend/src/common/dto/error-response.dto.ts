import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({
    example: ['email must be an email'],
    type: [String],
    description: 'Validation or business-rule details. Empty when not applicable.',
  })
  errors: string[];
}
