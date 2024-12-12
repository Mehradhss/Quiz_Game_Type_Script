import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm"
import {Category} from "./Category";
import {Question} from "./Question";
import {User} from "./User";
import {GameQuestion} from "./GameQuestion";
import {GameRoom} from "./GameRoom";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    status: string

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;

    @ManyToOne((type) => Category, (category) => category.games)
    category: Category

    @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
    gameQuestions: GameQuestion[]

    @OneToMany(()=>GameRoom , (gameRoom) =>gameRoom.game)
    gameRooms : GameRoom[]
}