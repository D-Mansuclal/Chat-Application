import { DataSource } from 'typeorm'
import logger from './logger.config';
import 'dotenv/config'

/**
 * The database connection configuration
 * @see https://typeorm.io/
 */
const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: ['../../src/models/**/*.ts']
});

dataSource.initialize().then(() => {
    logger.info('Database connection established.', { data: { database: process.env.DB_NAME } });
}
).catch(err => {
    logger.error('Database connection failed.', { data: { database: process.env.DB_NAME, error: err } });
});

export default dataSource;