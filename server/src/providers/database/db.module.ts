import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseProvider } from './db.provider';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [ConfigModule, TypeOrmModule],
    providers: [DatabaseProvider],
    exports: ['DATA_SOURCE'],
})
export class DatabaseModule {}
