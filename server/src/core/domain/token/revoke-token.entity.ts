import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class RevokedToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    jti: string;

    @CreateDateColumn()
    revokedAt: Date;
}
