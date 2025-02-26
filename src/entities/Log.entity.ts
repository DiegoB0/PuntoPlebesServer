import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from './User.entity'
import { ActionType } from './enums/ActionType.enum'

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  message: string

  @Column({
    type: 'enum',
    enum: ActionType
  })
  actionType: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
