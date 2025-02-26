import {
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm'
import { Meal } from './Meals.entity'
import { Menu } from './enums/Menu.enum'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  category_name: string

  @Column({
    type: 'enum',
    enum: Menu
  })
  menu_type: string

  @CreateDateColumn()
  created_at: Date

  @OneToMany(() => Meal, (meal) => meal.category)
  meals: Meal[]
}
