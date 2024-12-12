import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn} from "typeorm"
import {Question} from "./Question";
import {Answer} from "./Answer";
import {User} from "./User";
import {GameQuestion} from "./GameQuestion";

@Entity()

export class QuestionResult {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;

    @ManyToOne(() => GameQuestion, (gameQuestion) => gameQuestion.questionResults, {
        nullable: true,
        onDelete: "CASCADE"
    })
    gameQuestion: GameQuestion

    @ManyToOne(() => Answer, (answer) => answer.questionResults)
    answer: Answer

    @ManyToOne(() => User, (user) => user.questionResults)
    user: User
}