import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Order } from './Orders.entity'
import { Meal } from './Meals.entity'

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  order: Order

  @ManyToOne(() => Meal, (meal) => meal.orderItems)
  @JoinColumn({ name: 'meal_id' })
  meal: Meal

  @Column('text', { array: true, nullable: true })
  details: string[]

  @Column('numeric')
  price: number

  @Column('numeric')
  quantity: number
}
