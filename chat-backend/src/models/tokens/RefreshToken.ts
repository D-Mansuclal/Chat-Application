import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, ManyToOne } from "typeorm";
import { randomUUID } from "crypto";
import { User } from "../User";
import dataSource from "../../configs/db.config";
import 'dotenv/config';

/**
 * Model representing a refresh token
 * @param token UUID generated refresh token
 * @param user User that the token belongs to
 * @param clientDeviceIdentifier Unique identifier for the client device
 * @param ipAddress IP address of the client device
 * @param userAgent User agent of the client device
 * @param createdAt Date the token was created
 * @param expiresAt Date the token expires
 */
@Entity()
export class RefreshToken extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    token: string;

    @ManyToOne(() => User, (user) => user.refreshTokens)
    user: User;

    @Column()
    clientDeviceIdentifier: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true})
    userAgent: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expiresAt: Date;

    /**
     * Create a new refresh token linked to a user
     * @param user The user the refresh token belongs to
     * @param ipAddress The IP address of the client device
     * @param userAgent The user agent of the client device
     * @returns The created refresh token
     */
    public async createToken(user: User, ipAddress: string, userAgent: string) {
        this.user = user;
        this.clientDeviceIdentifier = randomUUID();;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.expiresAt = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRATION) * 1000 * 60 * 60 * 24);
        const refreshToken = await dataSource.getRepository(RefreshToken).save(this);
        return refreshToken;
    }
}

