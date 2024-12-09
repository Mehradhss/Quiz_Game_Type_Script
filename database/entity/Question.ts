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
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm"
import {Answer} from "./Answer";
import {Category} from "./Category";
import {QuestionResult} from "./QuestionResult";

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    text: string;

    @OneToMany((type) => Answer, (answer) => answer.question, {})
    answers: Answer[]

    @ManyToOne((type) => Category, (category) => category.questions, {
        nullable: false,
        onDelete: "CASCADE",
    })
    category: Category

    @OneToMany(type => QuestionResult , (questionResult) => questionResult.question, {})
    questionResults : QuestionResult[]
}