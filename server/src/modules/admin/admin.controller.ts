import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { UpdateManagerRequest } from '@/core/dto/manager/update-manager.request';

@Controller('admin')
@UseGuards(AuthGuardAccess)
export class AdminController {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly adminService: AdminService,
    ) {}

    @Get('departments')
    async getAllDepartments() {
        const result = await this.adminService.getAllDepartments();
        return result;
    }

    @Get('departments/:id')
    async getDepartment(@Param('id') id: number) {
        this.logger.APP.info('Parameters: ', id);
        const result = await this.adminService.getOneDepartment(id);
        return result;
    }

    @Put('departments/:id')
    async updateManagerDepartment(@Param('id', ParseIntPipe) idDepartment: number, @Body() req: UpdateManagerRequest) {
        this.logger.APP.info('Parameters: ', idDepartment);
        const result = await this.adminService.updateManagerDepartment(idDepartment, req.id_manager);
        return result;
    }

    @Post('departments/manager')
    async createManagerUser(@Body() req: CreateUserRequest) {
        this.logger.APP.info('Create department Req -> data: ' + JSON.stringify(req));

        const result = await this.adminService.createManagerUser(req);
        return result;
    }

    // @Patch('departments/:id')
    // updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    //     return `Cập nhật phòng ban ${id}`;
    // }

    // @Delete('departments/:id')
    // deleteDepartment(@Param('id') id: string) {
    //     return `Xóa phòng ban ${id}`;
    // }

    // // ------------------ Department Users ------------------
    // @Post('departments/:id/users')
    // addUserToDepartment(@Param('id') deptId: string, @Body() dto: CreateUserDto) {
    //     return `Thêm người dùng vào phòng ban ${deptId}`;
    // }

    // @Get('departments/:id/users')
    // getUsersInDepartment(@Param('id') deptId: string) {
    //     return `Danh sách người dùng trong phòng ban ${deptId}`;
    // }

    // @Get('departments/:deptId/users/:uid')
    // getUserDetail(@Param('deptId') deptId: string, @Param('uid') uid: string) {
    //     return `Thông tin người dùng ${uid} trong phòng ban ${deptId}`;
    // }

    // @Patch('departments/:deptId/users/:uid')
    // updateUser(@Param('deptId') deptId: string, @Param('uid') uid: string, @Body() dto: UpdateUserDto) {
    //     return `Cập nhật người dùng ${uid} trong phòng ban ${deptId}`;
    // }

    // @Delete('departments/:deptId/users/:uid')
    // deleteUser(@Param('deptId') deptId: string, @Param('uid') uid: string) {
    //     return `Xóa người dùng ${uid} khỏi phòng ban ${deptId}`;
    // }

    // // ------------------ Permissions ------------------
    // @Post('users/:id/permissions')
    // assignPermissions(@Param('id') userId: string, @Body() dto: AssignPermissionsDto) {
    //     return `Cấp quyền cho người dùng ${userId}`;
    // }

    // @Get('users/:id/permissions')
    // getPermissions(@Param('id') userId: string) {
    //     return `Danh sách quyền của người dùng ${userId}`;
    // }

    // @Patch('users/:id/permissions')
    // updatePermissions(@Param('id') userId: string, @Body() dto: AssignPermissionsDto) {
    //     return `Cập nhật quyền của người dùng ${userId}`;
    // }

    // @Delete('users/:id/permissions/:permId')
    // revokePermission(@Param('id') userId: string, @Param('permId') permId: string) {
    //     return `Thu hồi quyền ${permId} của người dùng ${userId}`;
    // }
}
