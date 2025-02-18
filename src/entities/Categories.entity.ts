import {
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm'
import { Meal } from './Meals.entity'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  category_name: string

  @Column()
  menu_type: string

  @CreateDateColumn()
  created_at: Date

  @OneToMany(() => Meal, (meal) => meal.category)
  meals: Meal[]
}
