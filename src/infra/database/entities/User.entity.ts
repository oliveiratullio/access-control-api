import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('users')
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() email: string;
  @Column() passwordHash: string;
  @Column({ type: 'varchar', length: 10, default: 'user' }) role: 'admin'|'user';
}
