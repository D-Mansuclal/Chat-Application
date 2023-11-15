import { DataSource } from 'typeorm'
import logger from './logger.config';
import 'dotenv/config'

const MODULE_NAME = "Database Configuration";

let host, port, database, username, password, synchronize;

switch (process.env.NODE_ENV) {
    case "production":
        host = process.env.PROD_DB_HOST,
        port = Number(process.env.PROD_DB_PORT),
        username = process.env.PROD_DB_USERNAME,
        password = process.env.PROD_DB_PASSWORD,
        database = process.env.PROD_DB_SCHEMA,
        synchronize = false
        break;
    case "development":
        host = process.env.DEV_DB_HOST,
        port = Number(process.env.DEV_DB_PORT),
        username = process.env.DEV_DB_USERNAME,
        password = process.env.DEV_DB_PASSWORD,
        database = process.env.DEV_DB_SCHEMA,
        synchronize = true
        break;
    case "testing":
        host = process.env.TEST_DB_HOST,
        port = Number(process.env.TEST_DB_PORT),
        username = process.env.TEST_DB_USERNAME,
        password = process.env.TEST_DB_PASSWORD,
        database = process.env.TEST_DB_SCHEMA,
        synchronize = true
        break;
    default:
        host = process.env.DEV_DB_HOST,
        port = Number(process.env.DEV_DB_PORT),
        username = process.env.DEV_DB_USERNAME,
        password = process.env.DEV_DB_PASSWORD,
        database = process.env.DEV_DB_SCHEMA,
        synchronize = true
        break;
}

/**
 * The database connection configuration
 * @see https://typeorm.io/
 */
const dataSource = new DataSource({
    type: 'mysql',
    host: host,
    port: port,
    username: username,
    password: password,
    database: database,
    synchronize: synchronize,
    logging: false,
    entities: ['src/models/**/*.ts']
});

if (process.env.NODE_ENV !== "testing") {
    dataSource.initialize().then(() => {
        logger.info('Database connection established.', { method: MODULE_NAME, 
            data: { database: process.env.NODE_ENV === "production" ? process.env.PROD_DB_SCHEMA : process.env.DEV_DB_SCHEMA } });
    }
    ).catch(err => {
        logger.error('Database connection failed.', { 
            method: MODULE_NAME, 
            data: { database: process.env.NODE_ENV === "production" ? process.env.PROD_DB_SCHEMA : process.env.DEV_DB_SCHEMA, 
            error: err 
        } });
    });
}

export default dataSource;