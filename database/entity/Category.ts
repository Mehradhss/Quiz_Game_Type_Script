import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm"
import {Question} from "./Question";
import {Answer} from "./Answer";
import {Game} from "./Game";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    title: string

    @OneToMany((type) => Question, (question) => question.category)
    questions: Question[]

    @OneToMany((type) => Game, (game) => game.category)
    games: Game[]
}