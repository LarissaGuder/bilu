import { Entity, PrimaryGeneratedColumn, Column, getRepository } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userName: string;

    @Column()
    spotifyId: string;

    @Column()
    acessToken: string;

    @Column()
    refreshToken: string;

    public static get repository() {
        return getRepository(this)
    }
}
