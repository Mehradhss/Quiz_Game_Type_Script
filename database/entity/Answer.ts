import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn} from "typeorm"
import {Question} from "./Question";
import {QuestionResult} from "./QuestionResult";

// exports = {
//     name: "answer",
//     columns: {
//         id: {
//             primary: true,
//             type: "int",
//             // generated: true,
//             nullable: false
//         },
//         text: {
//             unique: true,
//             type: "varchar"
//         },
//         question_id: {
//             type: "int"
//         },
//         is_correct: {
//             type :"bit"
//         }
//     },
//     relations: {
//         question :{
//             target: "question",
//             type: "many-to-one",
//             inverseSide: 'answers',
//             // joinTable: true,
//             joinColumn: {
//                 name: 'question_id',
//                 referencedColumnName: 'id'
//             }
//         }
//     }
// };
@Entity()
export class Answer {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    title: string

    @Column({nullable: false})
    text: string

    @Column({nullable: false, default: false})
    is_correct: boolean

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;

    @ManyToOne(type => Question, (question) => question.answers, {
        nullable: false,
        onDelete: "CASCADE",
    })
    question: Question

    @OneToMany(type => QuestionResult, (questionResult) => questionResult.answer, {})
    questionResults: QuestionResult[]
}