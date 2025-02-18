import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Order } from './Orders.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  payment_method: string;

  @Column('decimal')
  amount_given: number;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;

  @CreateDateColumn()
  created_at: Date;
}
