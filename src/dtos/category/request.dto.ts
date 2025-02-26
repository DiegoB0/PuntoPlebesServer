import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { Menu } from '../../entities/enums/Menu.enum'

export class InsertCategoryDTO {
  @IsString()
  @IsNotEmpty()
  category_name: string

  @IsEnum(Menu)
  @IsNotEmpty()
  menu_type: Menu
}

export class UpdateCategoryDTO {
  @IsString()
  @IsOptional()
  category_name?: string

  @IsEnum(Menu)
  @IsOptional()
  menu_type?: Menu
}
