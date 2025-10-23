import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('access_logs')
export class AccessLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() email: string;
  @Column() ip: string;
  @CreateDateColumn() createdAt: Date;
}
