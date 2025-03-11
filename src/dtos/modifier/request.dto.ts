import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsNumber
} from 'class-validator'
import { Type } from 'class-transformer'

class ClaveDTO {
  @IsString()
  @IsNotEmpty()
  palabra: string

  @IsString()
  @IsNotEmpty()
  clave: string
}

export class InsertModifierDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsArray()
  categoryIds: []

  @IsBoolean()
  hasPrice: boolean

  @IsNumber()
  price: number

  @ValidateNested()
  @Type(() => ClaveDTO)
  claveData: ClaveDTO
}

export class UpdateModifierDTO {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsArray()
  categoryIds: []

  @IsBoolean()
  hasPrice: boolean

  @IsNumber()
  price: number

  @ValidateNested()
  @Type(() => ClaveDTO)
  claveData: ClaveDTO
}
