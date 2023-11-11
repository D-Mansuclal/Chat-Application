import { DataSource } from 'typeorm'
import 'dotenv/config'

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
    console.log('Database connection established');
}
).catch(err => {
    console.log('Database connection failed');
    console.log(err);
    process.exit(1);
});

export default dataSource;