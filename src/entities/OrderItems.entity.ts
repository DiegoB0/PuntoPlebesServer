import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany
} from 'typeorm'
import { Order } from './Orders.entity'
import { Meal } from './Meals.entity'
import { OrderItemDetail } from './OrderItemDetails.entity'

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column('numeric')
  quantity: number

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'order_id' })
  order: Order

  @ManyToOne(() => Meal, (meal) => meal.orderItems)
  @JoinColumn({ name: 'meal_id' })
  meal: Meal

  @OneToMany(
    () => OrderItemDetail,
    (orderItemDetail) => orderItemDetail.orderItem,
    { nullable: true }
  )
  orderItemDetails: OrderItemDetail[]

  @CreateDateColumn()
  created_at: Date
}
