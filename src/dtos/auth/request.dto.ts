import { IsEmail, IsString, IsNotEmpty } from 'class-validator'

export class LoginUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
