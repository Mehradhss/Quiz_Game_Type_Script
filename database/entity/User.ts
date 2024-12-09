import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany} from "typeorm"
import {JoinTable} from "typeorm/browser";
import {QuestionResult} from "./QuestionResult";
import {Game} from "./Game";
import {Question} from "./Question";
import {Leaderboard} from "./Leaderboard";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    username: string

    @Column({nullable: false})
    password: string

    @Column()
    total_points: bigint

    @ManyToMany((type) => Game, {onDelete: "CASCADE"})
    @JoinTable({name: 'game_users', joinColumn: {name: 'id', referencedColumnName: 'user_id'}})
    games: Game[]

    @OneToMany((type) => QuestionResult, (questionResult) => questionResult.user, {})
    questionResults: QuestionResult[]

    @ManyToOne((type) => Leaderboard, (leaderBoard) => leaderBoard.users, {})
    leaderBoard: Leaderboard
}