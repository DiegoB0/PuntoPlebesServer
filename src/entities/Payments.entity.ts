import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne
} from 'typeorm'
import { Order } from './Orders.entity'
import { Pago } from './enums/Pago.enum'

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({
    type: 'enum',
    enum: Pago
  })
  payment_method: string

  @Column('decimal')
  amount_given: number

  @ManyToOne(() => Order, (order) => order.payments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  order: Order

  @CreateDateColumn()
  created_at: Date
}
