import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import dataSource from "../../configs/db.config";
import { User } from "../User";

/**
 * Model representing an activation token
 * @param token UUID generated activation token
 * @param user User that the token belongs to
 * @param createdAt Date the token was created
 * @param expiresAt Date the token expires
 */
@Entity()
export class ActivationToken extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    token: string;

    @OneToOne(() => User, (user) => user.activationToken, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expiresAt: Date;

    /**
     * Create a new activation token linked to a user
     * @param user The user the activation token belongs to
     * @returns The created activation token
     */
    public async createToken(user: User) {
        this.user = user;
        this.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        const activationToken = await dataSource.getRepository(ActivationToken).save(this);
        return activationToken;        
    }

    /**
     * Check if an activation token is expired
     * @returns true if the activation token is expired, false otherwise
     */
    public async isExpired() {
        if (this.expiresAt < new Date()) {
            await dataSource.getRepository(ActivationToken).remove(this);
            return true;
        }
        return false;
    }
}
