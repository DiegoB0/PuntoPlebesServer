import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne
} from 'typeorm'
import { Meal } from './Meals.entity'
import { Modificador } from './Modificadores.entity'
import { TipoClave } from './enums/Clave.enum'

@Entity('claves')
export class Clave {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  palabra: string

  @Column()
  clave: string

  @Column({
    type: 'enum',
    enum: TipoClave
  })
  tipo_clave: string

  @OneToOne(() => Meal, (meal) => meal.clave, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal

  @OneToOne(() => Modificador, (modificador) => modificador.clave, {
    nullable: true
  })
  @JoinColumn({ name: 'modificador_id' })
  modificador: Modificador

  @CreateDateColumn()
  created_at: Date
}
