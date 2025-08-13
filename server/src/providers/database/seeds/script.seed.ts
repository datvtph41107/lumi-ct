import { AppDataSource } from '@/config/database/db.config';
import { seedAdmin } from './admin.seed';
import { seedDepartment } from './department.seed';

async function runAllSeeds() {
    const dataSource = await AppDataSource.initialize();
    await seedAdmin(dataSource);
    await seedDepartment(dataSource);
    process.exit(1);
}

runAllSeeds().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
