import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm"
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

    @Column()
    title: string

    @Column()
    text: string

    @Column()
    is_correct: boolean

    @ManyToOne(type => Question, (question) => question.answers, {
        nullable: false,
        onDelete: "CASCADE",
    })
    question: Question

    @OneToMany(type => QuestionResult, (questionResult) => questionResult.question, {})
    questionResults: QuestionResult[]
}