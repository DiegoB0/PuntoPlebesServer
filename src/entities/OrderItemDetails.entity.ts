import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm'
import { OrderItem } from './OrderItems.entity'

@Entity('order_item_details')
export class OrderItemDetail {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.orderItemDetails, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  orderItem: OrderItem

  @Column('simple-array')
  details: string[]
}
