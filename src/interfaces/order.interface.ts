export interface Order {
  id: number
  order_number: number
  order_status: string
  client_name: string
  client_phone: string
  total_price: number

  // Related items (OrderItems)
  items: OrderItem[]

  // Payment details
  payments: Payments[]
}

export interface OrderItem {
  id: number
  order_id: number
  meal_id: number
  quantity: number

  // Item details (can be string or array of strings)
  details: OrderItemDetail[]
}

export interface OrderItemDetail {
  id: number
  order_item_id: number
  details: string[];
}

export interface Payments {
  payment_method: string
  amount_given: number
  order_id: number
}
