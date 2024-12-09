import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany} from "typeorm"
import {Category} from "./Category";
import {Question} from "./Question";
import {User} from "./User";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne((type) => Category , (category) => category.games)
    category: Category
}