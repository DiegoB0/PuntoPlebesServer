import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

class OrderItemDTO {
  @IsNumber()
  @IsNotEmpty()
  meal_id: number

  @IsNumber()
  @IsNotEmpty()
  quantity: number

  @IsOptional()
  @IsArray()
  details?: string[]
}

class PaymentDTO {
  @IsString()
  @IsNotEmpty()
  payment_method: string

  @IsNumber()
  @IsNotEmpty()
  amount_given: number
}

export class InsertOrderDTO {
  @IsString()
  @IsNotEmpty()
  client_name: string

  @IsString()
  @IsNotEmpty()
  client_phone: string

  @IsOptional()
  @IsString()
  order_status?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  items: OrderItemDTO[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDTO)
  payments: PaymentDTO[]
}

export class UpdateOrderDTO {
  @IsString()
  @IsOptional()
  client_name?: string

  @IsString()
  @IsOptional()
  client_phone?: string

  @IsOptional()
  @IsString()
  order_status?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  @IsOptional()
  items?: OrderItemDTO[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDTO)
  @IsOptional()
  payments?: PaymentDTO[]
}
