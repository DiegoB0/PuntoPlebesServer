import Joi from 'joi'
import { Order } from '../../interfaces/order.interface'

//Define the joi schema for creating orders
const CreateOrderSchema = Joi.object<Order>({
  order_number: Joi.string(),
  order_status: Joi.string(),
  client_name: Joi.string(),
  client_phone: Joi.string(),
  total_price: Joi.number(),
  items: Joi.array(),
  payments: Joi.array()
})

export const validateOrder = (order: Order) => {
  return CreateOrderSchema.validate(order)
}
