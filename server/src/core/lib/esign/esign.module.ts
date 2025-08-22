import { Global, Module } from '@nestjs/common';
import { ESignRegistry } from './esign.registry';

export const ESIGN_REGISTRY = 'ESIGN_REGISTRY';

@Global()
@Module({
    providers: [{ provide: ESIGN_REGISTRY, useClass: ESignRegistry }],
    exports: [ESIGN_REGISTRY],
})
export class ESignModule {}
