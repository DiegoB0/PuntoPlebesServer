import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm'
import { Role } from './enums/Role.enum'
import { APIKey } from './ApiKey.entity'
import { Order } from './Orders.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ nullable: false })
  name: string

  @Column({ unique: true, nullable: false })
  email: string

  @Column({ nullable: false })
  password: string

  @OneToMany(() => APIKey, (apiKey) => apiKey.user)
  apiKeys: APIKey[]

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[]

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Cashier
  })
  role: Role

  @CreateDateColumn()
  created_at: Date
}
