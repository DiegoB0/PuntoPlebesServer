import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne
} from 'typeorm'
import { Category } from './Categories.entity'
import { OrderItem } from './OrderItems.entity'
import { Clave } from './Claves.entity'

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column('decimal')
  price: number

  @ManyToOne(() => Category, (category) => category.id)
  @JoinColumn({ name: 'category_id' })
  category: Category

  @OneToMany(() => OrderItem, (orderItem) => orderItem.meal)
  orderItems: OrderItem[]

  @Column({ default: false })
  isClaveApplied: boolean

  @OneToOne(() => Clave, (clave) => clave.meal, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'clave_id' })
  clave: Clave

  @Column({ nullable: true })
  image_id: string

  @Column({ nullable: true })
  image_url: string

  @CreateDateColumn()
  created_at: Date
}
