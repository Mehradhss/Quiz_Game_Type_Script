import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm"
import {Question} from "./Question";
import {Answer} from "./Answer";
import {User} from "./User";

@Entity()

export class QuestionResult {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne((type) => Question, (question) => question.questionResults)
    question: Question

    @ManyToOne((type) => Answer , (answer) => answer.questionResults)
    answer: Answer

    @ManyToOne((type) => User , (user) => user.questionResults)
    user: User
}