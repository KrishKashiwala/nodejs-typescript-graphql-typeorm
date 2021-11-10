import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Users } from "./User";

@Entity()
export class Photo {
	@PrimaryGeneratedColumn() id: number;

	@Column() url: string;

	@Column({ nullable: true })
	userId: number;

	@ManyToOne(() => Users, user => user.photos)
	user: Users;
}