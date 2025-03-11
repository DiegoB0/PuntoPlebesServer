import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { OrderItem } from './OrderItems.entity'
import { Payment } from './Payments.entity'
import { OrderStatus } from './enums/OrderStatus.enum'
import { User } from './User.entity'

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  created_at: Date

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date
}
