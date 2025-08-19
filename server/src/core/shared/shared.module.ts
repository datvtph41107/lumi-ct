import { Module, Global } from '@nestjs/common';
import { RoleService } from './services/role.service';

@Global()
@Module({
    providers: [RoleService],
    exports: [RoleService],
})
export class SharedModule {}