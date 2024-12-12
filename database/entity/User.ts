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
import {Question} from "./Question";
import {Leaderboard} from "./Leaderboard";


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

    @ManyToMany(()=>User)
    @JoinTable ({name : "user_rooms"})
    users : User[]
}