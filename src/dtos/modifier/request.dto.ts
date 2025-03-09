import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsNumber
} from 'class-validator'
import { Type } from 'class-transformer'
import { Menu } from '../../entities/enums/Menu.enum'

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

  @IsOptional()
  @IsEnum(Menu)
  meal_type?: Menu

  @ValidateNested()
  @Type(() => ClaveDTO)
  claveData: ClaveDTO
}
