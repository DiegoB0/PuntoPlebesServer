import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './Categories.entity';
import { OrderItem } from './OrderItems.entity';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @ManyToOne(() => Category, category => category.id)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.meal)
  orderItems: OrderItem[];

  @Column()
  image_id: number;

  @Column()
  image_url: string;

  @CreateDateColumn()
  created_at: Date;
}
