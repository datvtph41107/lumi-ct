import { Contract } from '@/core/domain/contract';
import { ContractType } from '@/core/shared/enums/base.enums';
import { Repository, Between } from 'typeorm';
import { createHash } from 'crypto';

export async function generateContractCode(type: string, contractRepo: Repository<Contract>): Promise<string> {
    const upperType = type.toUpperCase() as ContractType;
    const now = new Date();

    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const yymm = `${year}${month}`;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const count = await contractRepo.count({
        where: {
            type: upperType,
            created_at: Between(startOfMonth, startOfNextMonth),
        },
    });

    const sequence = (count + 1).toString().padStart(3, '0');

    return `CT-${upperType}-${yymm}-${sequence}`;
}

export function calculateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
}
