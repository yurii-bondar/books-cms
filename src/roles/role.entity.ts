import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../permissions/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  role_id: number;

  @Column({ unique: true })
  name: string;

  @Column('simple-array', { nullable: true })
  permissions: number[];
}
