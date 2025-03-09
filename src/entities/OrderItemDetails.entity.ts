import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { OrderItem } from './OrderItems.entity'
import { Modificador } from './Modificadores.entity'

@Entity('order_item_details')
export class OrderItemDetail {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.orderItemDetails, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  orderItem: OrderItem

  @ManyToMany(() => Modificador)
  @JoinTable({
    name: 'details',
    joinColumn: { name: 'order_item_detail_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'modificador_id', referencedColumnName: 'id' }
  })
  details: Modificador[]
}
