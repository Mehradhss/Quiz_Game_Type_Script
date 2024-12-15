import {CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Game} from "./Game";

@Entity()
export class GameSession {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Game , (game) => game.session , {onDelete: "CASCADE"})
    @JoinColumn()
    game: Game;

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date;

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date;
}