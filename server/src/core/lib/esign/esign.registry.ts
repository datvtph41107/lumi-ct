import type { ESignAdapter } from './esign.types';

export class ESignRegistry {
    private readonly adapters = new Map<string, ESignAdapter>();

    register(adapter: ESignAdapter): void {
        this.adapters.set(adapter.name, adapter);
    }

    get(name: string): ESignAdapter | undefined {
        return this.adapters.get(name);
    }

    list(): ESignAdapter[] {
        return Array.from(this.adapters.values());
    }
}
