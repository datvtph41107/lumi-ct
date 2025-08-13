import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseProvider } from './db.provider';

@Module({
    imports: [ConfigModule],
    providers: [DatabaseProvider],
    exports: ['DATA_SOURCE'],
})
export class DatabaseModule {}
