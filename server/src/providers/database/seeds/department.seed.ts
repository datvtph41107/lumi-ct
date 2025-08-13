import { Department } from '@/core/domain/department';
import { DataSource } from 'typeorm';

export async function seedDepartment(dataSource: DataSource) {
    const repo = dataSource.getRepository(Department);

    const departmentsToSeed = [
        { name: 'Phòng Hành chính', code: 'HC' },
        { name: 'Phòng Kế toán', code: 'KT' },
    ];

    for (const dept of departmentsToSeed) {
        const existing = await repo.findOne({
            where: [{ code: dept.code }, { name: dept.name }],
        });

        if (existing) {
            console.log(`Department "${dept.name}" exist.`);
            process.exit(0);
        } else {
            await repo.save(dept);
        }
    }

    console.log('Seed department created.');
    // process.exit(0);
}
