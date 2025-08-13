import { AppDataSource } from '@/config/database/db.config';
import { Provider } from '@nestjs/common';

export const DatabaseProvider: Provider = {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
        const dataSource = await AppDataSource.initialize();
        // await dataSource.runMigrations(); // chạy tự động các migration chưa apply
        return dataSource;
    },
};
