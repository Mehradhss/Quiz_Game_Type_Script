import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn} from "typeorm"
import {Question} from "./Question";
import {Answer} from "./Answer";
import {Game} from "./Game";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    title: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @OneToMany((type) => Question, (question) => question.category)
    questions: Question[]

    @OneToMany((type) => Game, (game) => game.category)
    games: Game[]
}