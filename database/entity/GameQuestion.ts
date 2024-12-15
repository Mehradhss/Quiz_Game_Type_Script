import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./Game";
import {Question} from "./Question";
import {QuestionResult} from "./QuestionResult";

@Entity()
export class GameQuestion {
    @PrimaryGeneratedColumn()
    id: number

    @Column({default : null})
    questionText: string

    @ManyToOne(() => Game, (game) => game.gameQuestions)
    game: Game

    @ManyToOne(() => Question, (question) => question.gameQuestions)
    question: Question

    @OneToMany(() => QuestionResult, (questionResult) => questionResult.gameQuestion)
    questionResults: QuestionResult[]
}