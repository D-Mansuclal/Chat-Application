import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { RefreshToken } from "./tokens/RefreshToken";

/**
  * Database model for User
  * @param {string} id - The unique identifier for the user
  * @param {string} username - The username of the user
  * @param {string} email - The email of the user
  * @param {string} password - The encrypted password of the user
  * @param {RefreshToken[]} refreshTokens - The refresh tokens associated with the user
  * @param {Date} createdAt - The date the user was created
  * @param {Date} updatedAt - The date the user was last updated
 */
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}
