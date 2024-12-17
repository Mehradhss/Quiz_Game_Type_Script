import {Entity, Column, PrimaryGeneratedColumn, OneToMany, UpdateDateColumn, CreateDateColumn} from "typeorm"
import {Question} from "./Question";
import {Game} from "./Game";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false , unique : true})
    title: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @OneToMany(() => Question, (question) => question.category)
    questions: Question[]

    @OneToMany(() => Game, (game) => game.category)
    games: Game[]
}