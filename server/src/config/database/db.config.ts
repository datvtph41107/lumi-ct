import { TypeOrmWinstonLogger } from '@/core/shared/logger/logger.typeorm';
import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logger: new TypeOrmWinstonLogger(),
    synchronize: process.env.DB_HOST !== 'production',
    logging: true,
    entities: [__dirname + '/../../core/domain/**/*.entity.{ts,js}'],
    // migrations: [__dirname + '/../../providers/database/migrations/*.{ts,js}'], // file generate
});
