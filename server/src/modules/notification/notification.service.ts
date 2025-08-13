import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotificationType } from 'src/core/shared/enums/base.enums';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Notification } from '@/core/domain/notification';

@Injectable()
export class NotificationService {
    private readonly notificationRepo: Repository<Notification>;
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {
        this.notificationRepo = this.db.getRepository(Notification);
    }

    async create(payload: {
        type: NotificationType;
        title: string;
        message: string;
        data: string;
        userId: number;
        started_at?: Date;
        ended_at?: Date;
    }): Promise<Notification> {
        const notification = this.notificationRepo.create({
            type: payload.type,
            title: payload.title,
            message: payload.message,
            data: payload.data,
            user_id: payload.userId,
            started_at: payload.started_at,
            ended_at: payload.ended_at,
            created_at: new Date(),
        });

        const saved = await this.notificationRepo.save(notification);

        // await this.pushToUser(Number(saved.user_id), saved);

        return saved;
    }

    // private async pushToUser(userId: number, notification: Notification) {
    //     this.socketService.emitToUser(userId, 'notification', notification);
    // }

    async notifyUser(params: {
        userId: number;
        type: NotificationType;
        title: string;
        message?: string;
        data?: string;
        startedAt?: Date;
        endedAt?: Date;
    }) {
        const notification = this.notificationRepo.create({
            user_id: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            data: params.data,
            started_at: params.startedAt,
            ended_at: params.endedAt,
        });

        return this.notificationRepo.save(notification);
    }

    /**
     * Gửi thông báo hàng loạt đến nhiều user
     */
    async notifyManyUsers(params: {
        userIds: number[];
        type: NotificationType;
        title: string;
        message?: string;
        data?: string;
        startedAt?: Date;
        endedAt?: Date;
    }) {
        const notifications = params.userIds.map((userId) =>
            this.notificationRepo.create({
                user_id: userId,
                type: params.type,
                title: params.title,
                message: params.message,
                data: params.data,
                started_at: params.startedAt,
                ended_at: params.endedAt,
            }),
        );
        return this.notificationRepo.save(notifications);
    }

    /**
     * Lấy danh sách thông báo theo user
     */
    async getUserNotifications(userId: number) {
        return this.notificationRepo.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
        });
    }

    /**
     * Đánh dấu đã đọc thông báo
     */
    async markAsRead(id: number) {
        return this.notificationRepo.update(id, { read_at: new Date() });
    }
}
