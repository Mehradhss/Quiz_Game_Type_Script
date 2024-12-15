import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    UpdateDateColumn,
    CreateDateColumn, ManyToMany, OneToOne
} from "typeorm"
import {Category} from "./Category";
import {GameQuestion} from "./GameQuestion";
import {GameRoom} from "./GameRoom";
import {User} from "./User";
import {GameSession} from "./GameSession";

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

    @ManyToOne(() => Category, (category) => category.games)
    category: Category

    @ManyToMany(() => User, (user) => user.games)
    users: User[]

    @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
    gameQuestions: GameQuestion[]

    @ManyToOne(() => GameRoom, (gameRoom) => gameRoom.games)
    gameRoom: GameRoom

    @ManyToOne(() => User, (user) => user.wonGames)
    winner: User

    @OneToOne(() => GameSession, (session) => session.game)
    session: GameSession
}