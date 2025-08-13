import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { LoggerTypes } from 'src/core/shared/logger/logger.types';
import { ContractService } from './contract.service';
import { HeaderRequest, HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { RolesGuard } from '../auth/guards/role.guard';
import { CurrentUser, Roles } from '@/core/shared/decorators/setmeta.decorator';
import { Role } from '@/core/shared/enums/base.enums';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { UploadConfig } from '@/config/upload.config';
import { FilterQuery } from '@/common/utils/filter-query.utils';
import { CreateContractTaskRequest } from '@/core/dto/contract/contract-task.request';
import { CreateContractRequest } from '@/core/dto/contract/contract.request';

@UseGuards(AuthGuardAccess, RolesGuard)
@Controller('contracts')
export class ContractController {
    constructor(
        private readonly contractService: ContractService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    @Roles(Role.MANAGER)
    @UseInterceptors(FilesInterceptor('files', 10, new UploadConfig(new ConfigService()).multerOptions))
    @Post()
    async create(
        @Body() body: CreateContractRequest,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: HeaderUserPayload,
    ): Promise<any> {
        this.logger.APP.info('DATA: {}', body);
        return this.contractService.create(body, files, user);
    }
    // @Post()
    // @UseInterceptors(FilesInterceptor('files', 10, new UploadConfig(new ConfigService()).multerOptions))
    // async create(
    //     @Body() body: any,
    //     @UploadedFiles() files: Express.Multer.File[],
    //     @CurrentUser() user: HeaderUserPayload,
    // ): Promise<any> {
    //     const parsedPhases = JSON.parse(body.phases);
    //     const parsedTasks = JSON.parse(body.tasks);

    //     const fullData = {
    //         ...body,
    //         phases: parsedPhases,
    //         tasks: parsedTasks,
    //     };

    //     this.logger.APP.info('FULL DATA: ', fullData);
    //     return this.contractService.create(fullData, files, user);
    // }

    // @Post()
    // async createContract(
    //     @UploadedFiles() files: Express.Multer.File[],
    //     @Body() body: CreateContractRequest,
    //     @Req() req: HeaderRequest,
    // ) {
    //     const user = req.user;
    //     return this.contractService.createContract(body, files, user);
    // }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('files', 10, new UploadConfig(new ConfigService()).multerOptions))
    async updateContract(
        @Param('id') id: number,
        @Body() body: Partial<CreateContractRequest>,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: HeaderRequest,
    ) {
        return this.contractService.updateContract(id, body, files, req.user);
    }

    @Get()
    async getAllContracts(
        @CurrentUser() user: HeaderUserPayload,
        @Query('query') query?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page: number = 1,
        @Query('size') size: number = 20,
        @Query('asc') asc?: boolean,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('department_id') departmentId?: number,
    ): Promise<any> {
        const filter = new FilterQuery({
            query,
            startDate,
            endDate,
            page: Number(page),
            size: Number(size),
        });
        return await this.contractService.getAllContracts(user, filter, type, status, asc, departmentId);
    }

    @Get(':contractId')
    async getContract(@Param('contractId', ParseIntPipe) contractId: number) {
        return await this.contractService.getContract(contractId);
    }

    // @Get()
    // @Roles(Role.MANAGER)
    // @Post('/:contractId/tasks')
    // async createContractTask(
    //     @Param('contractId') contractId: string,
    //     @Body() req: CreateContractTaskRequest,
    //     @CurrentUser() user: HeaderUserPayload,
    // ) {
    //     return this.contractService.createContractTask(Number(contractId), req, user);
    // }

    @Get('my-task')
    async getMyTasks(
        @CurrentUser() user: HeaderUserPayload,
        @Query('query') query?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page: number = 1,
        @Query('size') size: number = 20,
        @Query('asc') asc?: boolean,
        @Query('type') type?: string,
        @Query('status') status?: string,
    ): Promise<any> {
        const filter = new FilterQuery({
            query,
            startDate,
            endDate,
            page: Number(page),
            size: Number(size),
        });

        return this.contractService.getMyTasks(user, filter, type, status, asc);
    }

    /**
     * Xóa hợp đồng (soft delete) - Manager only
     */
    @Roles(Role.MANAGER)
    @Delete(':contractId')
    async softDeleteContract(
        @Param('contractId', ParseIntPipe) contractId: number,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.softDelete(user, contractId);
    }

    /**
     * Cập nhật trạng thái hợp đồng riêng biệt - Manager only
     */
    // @Roles(Role.MANAGER)
    // @Patch(':id/status')
    // async updateContractStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: ContractStatus) {
    //     return this.contractService.updateStatus(id, status);
    // }

    /**
     * Cập nhật task hợp đồng - Manager và assigned Staff
     */
    @UseInterceptors(FilesInterceptor('files', 10, new UploadConfig(new ConfigService()).multerOptions))
    @Patch(':contractId/tasks/:taskId')
    async updateContractTask(
        @Param('contractId', ParseIntPipe) contractId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
        @Body() body: Partial<CreateContractTaskRequest>,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.updateContractTask(files, contractId, taskId, body, user);
    }

    /**
     * Xóa task hợp đồng - Manager only
     */
    @Roles(Role.MANAGER)
    @Delete(':contractId/tasks/:taskId')
    async deleteContractTask(
        @Param('contractId', ParseIntPipe) contractId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
    ) {
        return this.contractService.deleteContractTask(contractId, taskId);
    }

    // /**
    //  * Duyệt hợp đồng - Manager only
    //  */
    // @Roles(Role.MANAGER)
    // @Patch(':id/approve')
    // async approveContract(@Param('id', ParseIntPipe) id: number, @Req() req: HeaderRequest) {
    //     return this.contractService.approveContract(id, req.user);
    // }

    // /**
    //  * Từ chối hợp đồng - Manager only
    //  */
    // @Roles(Role.MANAGER)
    // @Patch(':id/reject')
    // async rejectContract(@Param('id', ParseIntPipe) id: number, @Req() req: HeaderRequest) {
    //     return this.contractService.rejectContract(id, req.user);
    // }
}
