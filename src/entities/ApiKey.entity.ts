import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn
} from 'typeorm'
import { User } from './User.entity'

@Entity('api_keys')
export class APIKey {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  key: string

  @ManyToOne(() => User, (user) => user.apiKeys, { onDelete: 'CASCADE' })
  user: User

  @CreateDateColumn()
  createdAt: Date
}
