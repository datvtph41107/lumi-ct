import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
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

    @Get('pending')
    getPending() {
        return this.service.getPendingNotifications();
    }

    @Get('failed')
    getFailed() {
        return this.service.getFailedNotifications();
    }

    @Post(':id/retry')
    async retrySend(@Param('id') id: string) {
        const success = await this.service.sendNotification(id);
        return { success };
    }
}
