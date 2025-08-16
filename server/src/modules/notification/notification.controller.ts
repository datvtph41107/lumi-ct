import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(AuthGuardAccess)
export class NotificationController {
    constructor(private readonly service: NotificationService) {}

    @Get('settings')
    getGlobalSettings() {
        return this.service.getGlobalSettings();
    }

    @Put('settings')
    updateGlobalSettings(@Body() body: any) {
        return this.service.updateGlobalSettings(body);
    }
}
