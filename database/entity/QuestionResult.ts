import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn} from "typeorm"
import {Question} from "./Question";
import {Answer} from "./Answer";
import {User} from "./User";

@Entity()

export class QuestionResult {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @ManyToOne((type) => Question, (question) => question.questionResults)
    question: Question

    @ManyToOne((type) => Answer , (answer) => answer.questionResults)
    answer: Answer

    @ManyToOne((type) => User , (user) => user.questionResults)
    user: User
}