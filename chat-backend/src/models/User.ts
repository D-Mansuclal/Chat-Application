import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from "typeorm";
import { RefreshToken } from "./tokens/RefreshToken";
import { ActivationToken } from "./tokens/ActivationToken";
import { PasswordResetToken } from "./tokens/PasswordResetToken";

/**
  * Database model for User
  * @param {string} id - The unique identifier for the user
  * @param {string} username - The username of the user
  * @param {string} email - The email of the user
  * @param {string} password - The encrypted password of the user
  * @param {boolean} activated - Whether the user has been activated or not
  * @param {RefreshToken[]} refreshTokens - The refresh tokens associated with the user
  * @param {ActivationToken} activationToken - The activation token associated with the user
  * @param {PasswordResetToken} passwordResetToken - The password reset token associated with the user
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

    @Column({ default: false })
    activated: boolean;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];

    @OneToOne(() => ActivationToken, (activationToken) => activationToken.user)
    activationToken: ActivationToken;

    @OneToOne(() => PasswordResetToken, (passwordResetToken) => passwordResetToken.user)
    passwordResetToken: PasswordResetToken;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
