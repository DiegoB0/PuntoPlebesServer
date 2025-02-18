import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"
import { Role } from "./enums/Role.enum"

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

  @Column({
    type: 'enum',
    enum: Role,  // Set the enum for the column
    default: Role.Cashier,  // Optional: set a default value
  })
  role: Role

  @CreateDateColumn()
  created_at: Date
}
