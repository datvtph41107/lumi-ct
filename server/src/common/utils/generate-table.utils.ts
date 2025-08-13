import { Repository, SelectQueryBuilder } from 'typeorm';

export function getPrimaryKeyName(qb: SelectQueryBuilder<any>): string {
    const alias = qb.expressionMap.mainAlias;
    if (!alias) {
        throw new Error('QueryBuilder is missing mainAlias metadata.');
    }

    const primaryColumns = alias.metadata.primaryColumns;
    if (primaryColumns.length === 0) {
        throw new Error(`Entity ${alias.metadata.name} has no primary column defined.`);
    }

    return primaryColumns[0].propertyName;
}

export function extractQbName(qb: SelectQueryBuilder<any>): string {
    return qb.expressionMap.mainAlias!.name;
}

export function extractTable(repo: Repository<any>) {
    const table = repo.metadata.tableName;
    const alias = generateAlias(table);
    return { table, alias };
}

export function generateAlias(tableName: string): string {
    const parts = tableName.split('_');

    return parts
        .map((part) => part[0])
        .join('')
        .toLowerCase();
}
