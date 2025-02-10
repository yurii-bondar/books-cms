import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../roles/role.entity';

import { RoleEnum } from '../constants/users';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  secondName: string;

  @Column({ unique: true })
  nickName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: RoleEnum.TRAINEE })
  roleId: number;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'roleId', referencedColumnName: 'role_id' })
  role: Role;
}
