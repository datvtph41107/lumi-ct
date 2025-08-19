export interface JsonDiffChange {
    path: string;
    type: 'added' | 'removed' | 'changed';
    before?: unknown;
    after?: unknown;
}

export function diffJson(before: unknown, after: unknown, basePath: string = ''): JsonDiffChange[] {
    const changes: JsonDiffChange[] = [];
    if (isPrimitive(before) || isPrimitive(after)) {
        if (!isEqual(before, after)) {
            changes.push({ path: basePath || '/', type: 'changed', before, after });
        }
        return changes;
    }

    const beforeObj = (before as Record<string, unknown>) || {};
    const afterObj = (after as Record<string, unknown>) || {};
    const keys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
    for (const key of keys) {
        const nextPath = basePath ? `${basePath}.${key}` : key;
        if (!(key in beforeObj)) {
            changes.push({ path: nextPath, type: 'added', after: afterObj[key] });
            continue;
        }
        if (!(key in afterObj)) {
            changes.push({ path: nextPath, type: 'removed', before: beforeObj[key] });
            continue;
        }
        if (isObject(beforeObj[key]) || isObject(afterObj[key])) {
            changes.push(...diffJson(beforeObj[key], afterObj[key], nextPath));
        } else if (!isEqual(beforeObj[key], afterObj[key])) {
            changes.push({ path: nextPath, type: 'changed', before: beforeObj[key], after: afterObj[key] });
        }
    }
    return changes;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isPrimitive(value: unknown): boolean {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function isEqual(a: unknown, b: unknown): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}

