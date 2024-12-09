import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm"
import {User} from "./User";

@Entity()
export class Leaderboard{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany((type) => User, (user) => user.leaderBoard)
    users: User[]
}