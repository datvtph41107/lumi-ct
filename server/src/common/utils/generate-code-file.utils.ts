import { Contract } from '@/core/domain/contract';
import { Repository, Like } from 'typeorm';
import { createHash } from 'crypto';

export async function generateContractCode(type: string, contractRepo: Repository<Contract>): Promise<string> {
    const upperType = (type || '').toUpperCase();
    const now = new Date();

    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const yymm = `${year}${month}`;

    const prefix = `CT-${upperType}-${yymm}-`;
    const count = await contractRepo.count({ where: { contract_code: Like(`${prefix}%`) } });
    const sequence = (count + 1).toString().padStart(3, '0');

    return `${prefix}${sequence}`;
}

export function calculateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
}
