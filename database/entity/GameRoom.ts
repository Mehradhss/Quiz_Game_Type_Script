import {
    Column,
    CreateDateColumn,
    Entity, ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Game} from "./Game";
import {User} from "./User";

@Entity()
export class GameRoom {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    uuid: string

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;

    @OneToMany(() => Game, (game) => game.gameRoom)
    games: Game[]

    @ManyToMany(() => User , (user) => user.gameRooms)
    users : User[]
}