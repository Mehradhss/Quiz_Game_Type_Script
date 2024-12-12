import {Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Game} from "./Game";
import {User} from "./User";

@Entity()
export class GameRoom {
    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(()=>Game , (game) => game.gameRooms)
    game:Game
}