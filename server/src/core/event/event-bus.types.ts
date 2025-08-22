export interface DomainEvent<TPayload = any> {
    name: string;
    payload: TPayload;
    timestamp: Date;
    meta?: Record<string, any>;
}

export interface EventHandler<T = any> {
    handle(event: DomainEvent<T>): Promise<void> | void;
}

export interface EventBus {
    publish<T>(event: DomainEvent<T>): Promise<void> | void;
    subscribe(eventName: string, handler: EventHandler): void;
    unsubscribe(eventName: string, handler: EventHandler): void;
}
