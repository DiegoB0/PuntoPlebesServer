import Joi from 'joi'
import { Order, OrderItem, Payments } from '../../interfaces/order.interface'

// Define schema for OrderItem
const OrderItemSchema = Joi.object<OrderItem>({
  meal_id: Joi.number().required(), // meal_id is now required
  quantity: Joi.number().required(), // quantity is required
  details: Joi.array().items(Joi.string()).optional() // details is an optional array of strings
})

// Define schema for Payments
const PaymentsSchema = Joi.object<Payments>({
  payment_method: Joi.string().required(),
  amount_given: Joi.number().required()
})

// Define schema for Order
const CreateOrderSchema = Joi.object<Order>({
  client_name: Joi.string().required(),
  client_phone: Joi.string().required(),
  items: Joi.array().items(OrderItemSchema).required(), // items array is required
  payments: Joi.array().items(PaymentsSchema).required() // payments array is required
})

// Validate function
export const validateOrder = (order: Order) => {
  return CreateOrderSchema.validate(order)
}

// Define schema for OrderItem (optional for updates)
const OrderItemSchemaForUpdate = Joi.object<OrderItem>({
  id: Joi.number().optional(),
  meal_id: Joi.number().optional(), // meal_id is now optional for updates
  quantity: Joi.number().optional(), // quantity is optional for updates
  details: Joi.array().items(Joi.string()).optional() // details is an optional array of strings
})

// Define schema for Payments (optional for updates)
const PaymentsSchemaForUpdate = Joi.object<Payments>({
  payment_method: Joi.string().optional(),
  amount_given: Joi.number().optional()
})

// Define schema for Order (optional for updates)
const UpdateOrderSchema = Joi.object<Order>({
  client_name: Joi.string().optional(),
  client_phone: Joi.string().optional(),
  order_status: Joi.string().optional(),
  items: Joi.array().items(OrderItemSchemaForUpdate).optional(), // items array is optional
  payments: Joi.array().items(PaymentsSchemaForUpdate).optional() // payments array is optional
})

// Validate function for updating order
export const validateUpdateOrder = (order: Order) => {
  return UpdateOrderSchema.validate(order)
}
