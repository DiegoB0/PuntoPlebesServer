import { IsString, IsNotEmpty } from 'class-validator'

export class InsertPlainClaveDTO {
  @IsString()
  @IsNotEmpty()
  palabra: string

  @IsString()
  @IsNotEmpty()
  clave: string
}
