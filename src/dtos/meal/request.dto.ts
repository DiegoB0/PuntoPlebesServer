import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator'

export class InsertMealDTO {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsInt()
  categoryId: number

  @IsOptional()
  @IsString()
  image_url?: string

  @IsOptional()
  @IsString()
  image_id?: number

  @IsInt()
  price?: number

  // For Clave
  @IsBoolean()
  isClaveApplied: boolean

  @IsString()
  palabra: string

  @IsString()
  clave: string
}

export class UpdateMealDTO {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  categoryId?: number

  @IsOptional()
  @IsString()
  image_url?: string

  @IsOptional()
  @IsString()
  image_id?: number

  @IsOptional()
  @IsInt()
  price?: number

  @IsOptional()
  @IsBoolean()
  isClaveApplied: boolean

  @IsOptional()
  @IsString()
  palabra?: string

  @IsOptional()
  @IsString()
  clave?: string
}
