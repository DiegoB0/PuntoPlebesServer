import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class InsertClaveDTO {
  @IsString()
  @IsNotEmpty()
  palabra: string

  @IsString()
  @IsNotEmpty()
  clave: string
}

export class UpdateClaveDTO {
  @IsString()
  @IsOptional()
  palabra: string

  @IsString()
  @IsOptional()
  clave: string
}
