import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { Admin } from '@/core/domain/admin';
import { AdminRole } from '@/core/shared/enums/base.enums';
import { DataSource } from 'typeorm';

config();

export async function seedAdmin(dataSource: DataSource) {
    const repo = dataSource.getRepository(Admin);

    const existing = await repo.findOneBy({ name: 'admin' });
    if (existing) {
        console.log('Admin already exists');
        return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = repo.create({ name: 'admin', password: hashedPassword, role: AdminRole.SUPER_ADMIN });
    await repo.save(admin);

    console.log('Admin seed created');
    // process.exit(0);
}
