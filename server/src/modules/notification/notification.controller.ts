import { Body, Controller, Get, Param, Post, Put, UseGuards, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { Roles } from '@/core/shared/decorators/setmeta.decorator';
import { Role } from '@/core/shared/enums/base.enums';

@Controller('notifications')
@UseGuards(AuthGuardAccess)
export class NotificationController {
    constructor(private readonly service: NotificationService) {}

    @Get('settings')
    @Roles(Role.MANAGER)
    getGlobalSettings() {
        return this.service.getGlobalSettings();
    }

    @Put('settings')
    @Roles(Role.MANAGER)
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

    // Reschedule / Update a reminder/notification (smart re-send)
    @Put('reminders/:id')
    @Roles(Role.MANAGER)
    async updateReminder(@Param('id') id: string, @Body() body: any) {
        const updated = await this.service.updateReminder(id, body);
        return { success: true, data: updated } as any;
    }
    @Post('reminders/:id/trigger')
    @Roles(Role.MANAGER)
    async triggerReminder(@Param('id') id: string) {
        const success = await this.service.triggerReminder(id);
        return { success } as any;
    }
}
