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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @Column()
    total_points: number

    @ManyToMany((type) => Game, {onDelete: "CASCADE"})
    @JoinTable({name: 'game_users', joinColumn: {name: 'user_id', referencedColumnName: 'id'}})
    games: Game[]

    @OneToMany((type) => QuestionResult, (questionResult) => questionResult.user, {})
    questionResults: QuestionResult[]

    @ManyToOne((type) => Leaderboard, (leaderBoard) => leaderBoard.users, {})
    leaderBoard: Leaderboard
}