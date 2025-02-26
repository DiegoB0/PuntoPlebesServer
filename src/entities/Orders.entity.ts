import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm'
import { OrderItem } from './OrderItems.entity'
import { Payment } from './Payments.entity'
import { OrderStatus } from './enums/OrderStatus.enum'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  order_number: number

  @Column({
    type: 'enum',
    enum: OrderStatus
  })
  order_status: string

  @Column()
  client_name: string

  @Column()
  client_phone: string

  @Column()
  total_price: number

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[]

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[]

  @CreateDateColumn()
  created_at: Date
}
