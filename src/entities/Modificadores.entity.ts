import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { Clave } from './Claves.entity'
import { Category } from './Categories.entity'

@Entity('modificadores')
export class Modificador {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  hasPrice: boolean

  @Column()
  price?: number

  @ManyToMany(() => Category, (category) => category.modificadores)
  @JoinTable({
    name: 'modifier_category', // Join table name
    joinColumn: { name: 'modificador_id', referencedColumnName: 'id' },

    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
  })
  categories: Category[]

  @OneToOne(() => Clave, (clave) => clave.modificador)
  @JoinColumn({ name: 'clave_id' })
  clave: Clave

  @CreateDateColumn()
  created_at: Date
}
