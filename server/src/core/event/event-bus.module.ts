import { Global, Module } from '@nestjs/common';
import { InMemoryEventBus } from './event-bus.memory';

export const EVENT_BUS = 'EVENT_BUS';

@Global()
@Module({
    providers: [{ provide: EVENT_BUS, useClass: InMemoryEventBus }],
    exports: [EVENT_BUS],
})
export class EventBusModule {}
