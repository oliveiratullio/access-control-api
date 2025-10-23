import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'alice@local.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(3)
  password: string;

  @ApiProperty({ example: 'user', enum: ['admin', 'user'], required: false })
  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';
}
