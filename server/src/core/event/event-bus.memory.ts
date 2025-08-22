import type { DomainEvent, EventBus, EventHandler } from './event-bus.types';

export class InMemoryEventBus implements EventBus {
    private readonly handlers = new Map<string, Set<EventHandler>>();

    publish<T>(event: DomainEvent<T>): void {
        const hs = this.handlers.get(event.name);
        if (!hs || hs.size === 0) return;
        for (const h of hs) {
            try {
                void Promise.resolve(h.handle(event));
            } catch (_e) {
                console.log(`Error handling event ${event.name}:`, _e);
            }
        }
    }

    subscribe(eventName: string, handler: EventHandler): void {
        if (!this.handlers.has(eventName)) this.handlers.set(eventName, new Set());
        this.handlers.get(eventName)!.add(handler);
    }

    unsubscribe(eventName: string, handler: EventHandler): void {
        this.handlers.get(eventName)?.delete(handler);
    }
}
