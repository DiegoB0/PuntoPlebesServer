import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm'
import { OrderItem } from './OrderItems.entity'
import { Payment } from './Payments.entity'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  order_number: number

  @Column()
  order_status: string

  @Column()
  client_name: string

  @Column()
  client_phone: string

  @Column()
  total_price_numeric: number

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[]

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[]

  @CreateDateColumn()
  created_at: Date
}
