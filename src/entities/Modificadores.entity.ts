import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { Clave } from './Claves.entity'
import { Menu } from './enums/Menu.enum'

@Entity('modificadores')
export class Modificador {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column({
    type: 'enum',
    enum: Menu,
    nullable: true
  })
  meal_type: string

  @Column()
  hasPrice: boolean

  @Column()
  price?: number

  @OneToOne(() => Clave, (clave) => clave.modificador)
  @JoinColumn({ name: 'clave_id' })
  clave: Clave

  @CreateDateColumn()
  created_at: Date
}
