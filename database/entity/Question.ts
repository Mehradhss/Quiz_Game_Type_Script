// module.exports = {
//     name: "question",
//       },
//
//         games : {
//             target : 'game',
//             type : 'many-to-many',
//             inverseSide: 'questions'
//         } ,
//     }
// }
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn} from "typeorm"
import {Answer} from "./Answer";
import {Category} from "./Category";
import {GameQuestion} from "./GameQuestion";

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, unique: true})
    text: string;

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;

    @OneToMany(() => Answer, (answer) => answer.question, {})
    answers: Answer[]

    @ManyToOne(() => Category, (category) => category.questions, {
        nullable: false,
        onDelete: "CASCADE",
    })
    category: Category

    @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.question)
    gameQuestions: GameQuestion[]
}