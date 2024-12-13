import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    UpdateDateColumn,
    CreateDateColumn,
    JoinTable
} from "typeorm"
import {QuestionResult} from "./QuestionResult";
import {Game} from "./Game";
import {Leaderboard} from "./Leaderboard";
import {GameRoom} from "./GameRoom";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    username: string

    @Column({nullable: false})
    password: string

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;

    @Column({nullable: false, default: 0})
    total_points: number

    @ManyToMany(() => Game, {cascade: true, onDelete: "CASCADE"})
    @JoinTable({name: 'game_users', joinColumn: {name: 'user_id', referencedColumnName: 'id'}})
    games: Game[]

    @OneToMany(() => QuestionResult, (questionResult) => questionResult.user, {})
    questionResults: QuestionResult[]

    @ManyToOne(() => Leaderboard, (leaderBoard) => leaderBoard.users, {})
    leaderBoard: Leaderboard

    @OneToMany(() => Game, (game) => game.winner, {})
    wonGames : Game[]

    @ManyToMany(()=>GameRoom)
    @JoinTable ({name : "user_rooms"})
    gameRooms : GameRoom[]
}