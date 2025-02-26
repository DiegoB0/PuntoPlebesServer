import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum
} from 'class-validator'
import { Role } from '../../entities/enums/Role.enum'

export class InsertUserDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role
}
