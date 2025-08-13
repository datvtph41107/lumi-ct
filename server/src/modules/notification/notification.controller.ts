// import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
// import { NotificationService } from './notification.service';

// @Controller('notifications')
// export class NotificationController {
//     constructor(private readonly service: NotificationService) {}

//     @Get(':userId')
//     getByUser(@Param('userId') userId: number) {
//         return this.service.findByUser(userId);
//     }

//     @Get(':userId/unread-count')
//     getUnreadCount(@Param('userId') userId: number) {
//         return this.service.countUnread(userId);
//     }

//     @Post()
//     create(@Body() body: { userId: number; title: string; content?: string }) {
//         return this.service.create(body.userId, body.title, body.content);
//     }

//     @Patch(':id/read')
//     markAsRead(@Param('id') id: number) {
//         return this.service.markAsRead(id);
//     }
// }
