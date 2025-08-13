import {
    ContractPhaseStatus,
    ContractStatus,
    NotificationType,
    Role,
    TaskStatus,
} from '@/core/shared/enums/base.enums';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import {
    BadRequestException,
    // ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Contract } from 'src/core/domain/contract/contract.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { FileUploadService } from '../uploadFile/upload-file.service';
import { ContractFile } from '@/core/domain/contract/contract-file.entity';
import { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { ConfigService } from '@nestjs/config';
import { QueryRunner } from 'typeorm';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';
import { calculateFileHash, generateContractCode } from '@/common/utils/generate-code-file.utils';
import { ContractFileHistory } from '@/core/domain/contract/contract-file-history.entity';
import { ContractQueryBuilder } from '@/core/query/contract.query';
// import { Department } from '@/core/domain/department';
import { FilterQuery, paginate } from '@/common/utils/filter-query.utils';
import { PaginatedResult } from '@/core/shared/interface/paginate.interface';
import { User } from '@/core/domain/user';
import { ContractTask } from '@/core/domain/contract/contract-taks.entity';
import { ContractTaskFile } from '@/core/domain/contract/contract-task-files.entity';
import * as crypto from 'crypto';
import { ContractPhase } from '@/core/domain/contract';
import { CreateContractPhaseRequest } from '@/core/dto/contract/contract-phase.request';
import { CreateContractTaskRequest } from '@/core/dto/contract/contract-task.request';
import { CreateContractRequest } from '@/core/dto/contract/contract.request';
import { NotificationService } from '../notification/notification.service';
import { ContractNotify } from '@/core/shared/interface/contract.interface';

@Injectable()
export class ContractService {
    private readonly contractRepo: Repository<Contract>;
    private readonly contractFileRepo: Repository<ContractFile>;
    private readonly userRepo: Repository<User>;
    private readonly taskRepo: Repository<ContractTask>;
    private readonly taskFileRepo: Repository<ContractTaskFile>;
    private readonly contractPhaseRepo: Repository<ContractPhase>;
    // private readonly departmentRepo: Repository<Department>;
    private readonly contractFileHistoryRepo: Repository<ContractFileHistory>;
    private readonly baseUrl: string;
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly configService: ConfigService,
        private readonly uploadService: FileUploadService,
        private readonly notificationService: NotificationService,
    ) {
        this.contractRepo = this.db.getRepository(Contract);
        this.contractFileRepo = this.db.getRepository(ContractFile);
        this.contractFileHistoryRepo = this.db.getRepository(ContractFileHistory);
        this.userRepo = this.db.getRepository(User);
        this.taskRepo = this.db.getRepository(ContractTask);
        this.contractPhaseRepo = this.db.getRepository(ContractPhase);
        // this.departmentRepo = this.db.getRepository(Department);
        this.baseUrl = this.configService.get<string>('BASE_FILE_URL') ?? '';
    }

    async create(body: CreateContractRequest, files: Express.Multer.File[], user: HeaderUserPayload) {
        const queryRunner = this.db.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const contract = await this.createContract(body, files, user, queryRunner);
            const phases = await this.createContractPhases(contract.id, body.phases || [], queryRunner);
            const tasksPhase = (body.tasks || []).map((task) => {
                const phaseId =
                    task.phaseIndex !== undefined && phases[task.phaseIndex] ? phases[task.phaseIndex].id : null;

                return {
                    ...task,
                    contract_id: contract.id,
                    phase_id: phaseId,
                };
            });
            const tasks = await this.createContractTasks(contract.id, tasksPhase, user, queryRunner);
            await queryRunner.commitTransaction();

            await this.notificationSetting(contract);

            return {
                message: 'Contract created successfully',
                data: {
                    ...contract,
                    phases,
                    tasks,
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.APP.error('Create contract failed:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async notificationSetting(contract: ContractNotify) {
        const relatedUserIds = await ContractQueryBuilder.findRelatedUserIds(contract.id, this.db);

        await this.notificationService.notifyManyUsers({
            userIds: relatedUserIds,
            type: NotificationType.CONTRACT_CREATED,
            title: 'New Contract Created',
            message: `Contract "${contract.name}" has been created.`,
            data: `${contract.id}`,
            startedAt: contract.start_date,
            endedAt: contract.end_date,
        });

        this.logger.APP.info(
            `🔔 Sent creation notification for contract ${contract.id} to users: ${relatedUserIds.join(', ')}`,
        );
    }

    private async createContract(
        body: CreateContractRequest,
        files: Express.Multer.File[],
        user: HeaderUserPayload,
        queryRunner: QueryRunner,
    ) {
        // if (!files || files.length === 0) {
        //     throw new BadRequestException(ERROR_MESSAGES.FILE.REQUIED);
        // }

        // const duplicateFiles = await this.checkDuplicateFiles(files);
        // if (duplicateFiles.length > 0) {
        //     throw new ConflictException({
        //         message: ERROR_MESSAGES.FILE.DUPLICATES,
        //         dataError: duplicateFiles,
        //     });
        // }

        // const userId = Number(user.sub);
        const code = await generateContractCode(body.type, this.contractRepo);
        const contract = this.contractRepo.create({
            ...body,
            code,
            department_id: Number(user.department?.id),
            created_by: user.sub,
            status: ContractStatus.DRAFT,
        });

        const savedContract = await queryRunner.manager.save(contract);
        // const uploadedFiles = await this.attachFilesToContract(savedContract.id, files, userId, queryRunner);

        return {
            id: savedContract.id,
            code: savedContract.code,
            name: savedContract.name,
            type: savedContract.type,
            description: savedContract.description,
            status: savedContract.status,
            start_date: savedContract.start_date,
            end_date: savedContract.end_date,
            created_by: savedContract.created_by,
            department_id: savedContract.department_id,
            contract_files: [],
            // contract_files: uploadedFiles.map((file) => ({
            //     id: file.id,
            //     file_name: file.file_name,
            //     file_path: `${this.baseUrl}/${file.file_name}`,
            //     uploaded_at: file.updated_at,
            // })),
        };
    }

    private async createContractPhases(
        contractId: number,
        phaseReq: CreateContractPhaseRequest[],
        queryRunner: QueryRunner,
    ) {
        try {
            if (!phaseReq || phaseReq.length === 0) {
                return [];
            }

            const contract = phaseReq.map((phase) =>
                this.contractPhaseRepo.create({
                    ...phase,
                    contract_id: contractId,
                    status: ContractPhaseStatus.PENDING,
                }),
            );

            const savedPhases = await queryRunner.manager.save(contract);
            return savedPhases;
        } catch (error) {
            this.logger.APP.error('Create contract phases error:', error);
            throw error;
        }
    }

    private async createContractTasks(
        contractId: number,
        tasksReq: CreateContractTaskRequest[],
        user: HeaderUserPayload,
        queryRunner: QueryRunner,
    ) {
        try {
            if (!tasksReq || tasksReq.length === 0) return [];

            const tasks: ContractTask[] = [];

            for (const req of tasksReq) {
                if (req.assignedToId) {
                    const assignedUser = await this.userRepo.findOne({
                        where: { id: req.assignedToId, role: Role.STAFF },
                    });

                    if (!assignedUser || Number(assignedUser.department_id) !== user.department?.id) {
                        throw new ForbiddenException('Cannot assign to non-department staff');
                    }
                }

                const task = this.taskRepo.create({
                    name: req.name,
                    description: req.description,
                    due_date: new Date(req.dueDate),
                    assignedToId: req.assignedToId,
                    contractId: contractId,
                    status: req.status || TaskStatus.WAITING_CONFIRM,
                    createdBy: Number(user.sub),
                    note: req.note,
                });

                tasks.push(task);
            }

            const savedTasks = await queryRunner.manager.save(tasks);
            return savedTasks;
        } catch (error) {
            this.logger.APP.error('Create CONTRACT TASK ERROR:', error);
            throw error;
        }
    }

    async getAllContracts(
        user: HeaderUserPayload,
        filter: FilterQuery,
        type?: string,
        status?: string,
        asc?: boolean,
        departmentId?: number,
    ): Promise<PaginatedResult<Contract>> {
        const qb = this.contractRepo
            .createQueryBuilder('contract')
            .leftJoinAndMapMany('contract.contract_files', 'contract_files', 'cf', 'cf.contract_id = contract.id')
            .leftJoinAndMapMany('contract.contract_tasks', 'contract_tasks', 'ct', 'ct.contract_id = contract.id')
            .leftJoinAndMapOne('contract.department', 'departments', 'd', 'd.id = contract.department_id');

        const isManager = this.isManager(user);

        if (!isManager) {
            qb.innerJoin('contract.contract_tasks', 'staff_tasks', 'staff_tasks.assigned_to_id = :userId', {
                userId: user.sub,
            });
        }

        const query = new ContractQueryBuilder(qb)
            .search(filter.query)
            .createdBetween(filter.getStartDate(), filter.getEndDate())
            .withType(type)
            .withStatus(status)
            .withDepartment(departmentId)
            .values();

        const result = await paginate(query, filter, {
            qbNameEntity: 'contract',
            defaultOrderBy: 'created_at',
            sortDirection: asc,
        });

        return result;
    }

    async getContract(contractId: number) {
        try {
            const contract = await this.contractRepo.findOne({
                where: { id: contractId },
            });

            if (!contract) {
                throw new NotFoundException(`Contract ID ${contractId} not found`);
            }

            const tasks = await this.taskRepo.find({
                where: { contractId },
                order: { due_date: 'ASC' },
            });

            const contractFiles = await this.contractFileRepo.find({
                where: { contract_id: contractId },
                order: { updated_at: 'DESC' },
            });

            const tasksWithDetails = await Promise.all(
                tasks.map(async (task) => {
                    const taskFiles = await this.taskFileRepo.find({
                        where: { task_id: task.id },
                        order: { updated_at: 'DESC' },
                    });

                    // const taskReplies = await this.taskReplyRepo.find({
                    //     where: { task_id: task.id },
                    //     order: { created_at: 'ASC' },
                    // });

                    return {
                        contract,
                        ...task,
                        files: taskFiles.map((file) => ({
                            id: file.id,
                            file_name: file.file_name,
                            file_path: `${this.baseUrl}/${file.file_name}`,
                            uploaded_at: file.updated_at,
                        })),
                        // replies: taskReplies.map((reply) => ({
                        //     id: reply.id,
                        //     content: reply.content,
                        //     created_at: reply.created_at,
                        //     user_id: reply.user_id, // nếu cần phân biệt người gửi
                        // })),
                    };
                }),
            );

            return {
                ...contract,
                contract_files: contractFiles.map((file) => ({
                    id: file.id,
                    file_name: file.file_name,
                    file_path: `${this.baseUrl}/${file.file_name}`,
                    uploaded_at: file.updated_at,
                })),
                tasks: tasksWithDetails,
            };
        } catch (error) {
            this.logger.APP.error('GET CONTRACT DETAIL ERROR:', error);
            throw error;
        }
    }

    async getTask(taskId: number) {
        try {
            const task = await this.taskRepo.findOne({
                where: { id: taskId },
            });

            if (!task) {
                throw new NotFoundException(`Task ID ${taskId} not found`);
            }

            const taskFiles = await this.taskFileRepo.find({
                where: { task_id: taskId },
                order: { updated_at: 'ASC' },
            });

            return {
                task,
                task_files: taskFiles.map((file) => ({
                    id: file.id,
                    file_name: file.file_name,
                    file_path: `${this.baseUrl}/${file.file_name}`,
                    uploaded_at: file.updated_at,
                })),
            };
        } catch (error) {
            this.logger.APP.error('GET CONTRACT DETAIL ERROR:', error);
            throw error;
        }
    }

    async getMyTasks(
        user: HeaderUserPayload,
        filter: FilterQuery,
        type?: string,
        status?: string,
        asc?: boolean,
    ): Promise<PaginatedResult<ContractTask>> {
        try {
            const qb = this.taskRepo
                .createQueryBuilder('contract_task')
                .where('ct.assigned_to_id = :userId', { userId: user.sub });

            const query = new ContractQueryBuilder(qb)
                .search(filter.query)
                .createdBetween(filter.getStartDate(), filter.getEndDate())
                .withType(type)
                .withStatus(status)
                .values();

            const result = await paginate(query, filter, {
                qbNameEntity: 'contract',
                defaultOrderBy: 'created_at',
                sortDirection: asc,
            });

            return result;
        } catch (error) {
            this.logger.APP.error('GET MY TASK ERROR: ', error);
            throw error;
        }
    }

    private async checkDuplicateFiles(
        files: Express.Multer.File[],
        currentContractId?: number,
    ): Promise<
        {
            fileName: string[];
            inContract: {
                id: number;
                name: string;
                code: string;
            };
        }[]
    > {
        const contractMap = new Map<
            number,
            { fileNames: string[]; inContract: { id: number; name: string; code: string } }
        >();

        for (const file of files) {
            const hash = calculateFileHash(file.buffer);

            const existingFile = await this.contractFileRepo.findOne({
                where: {
                    file_hash: hash,
                    ...(currentContractId ? { contract_id: Not(currentContractId) } : {}),
                },
            });

            if (existingFile) {
                const contract = await this.contractRepo.findOne({ where: { id: existingFile.contract_id } });
                if (contract) {
                    if (!contractMap.has(contract.id)) {
                        contractMap.set(contract.id, {
                            fileNames: [file.originalname],
                            inContract: { id: contract.id, name: contract.name, code: contract.code },
                        });
                    } else {
                        contractMap.get(contract.id)!.fileNames.push(file.originalname);
                    }
                }
            }
        }

        return Array.from(contractMap.values()).map((entry) => ({
            fileName: entry.fileNames,
            inContract: entry.inContract,
        }));
    }

    private async attachFilesToContract(
        contractId: number,
        files: Express.Multer.File[],
        userId: number,
        queryRunner: QueryRunner,
    ): Promise<ContractFile[]> {
        const entities: ContractFile[] = [];
        const contractFolder = this.getContractFolderName(contractId);

        for (const file of files) {
            const hash = calculateFileHash(file.buffer);
            const existingFile = await this.contractFileRepo.findOne({
                where: { contract_id: contractId, file_name: file.originalname },
            });

            if (existingFile) {
                await this.contractFileHistoryRepo.insert({
                    contract_file_id: existingFile.id,
                    old_file_url: existingFile.file_url,
                    updated_at: new Date(),
                    updated_by: userId,
                });
                await queryRunner.manager.remove(ContractFile, existingFile);
            }
            const result = await this.uploadService.upload(file, contractFolder);

            const entity = this.contractFileRepo.create({
                contract_id: contractId,
                file_name: file.originalname,
                file_hash: hash,
                file_url: result.url,
                file_path: `${this.baseUrl}/${contractFolder}/${file.originalname}`,
                file_type: file.mimetype,
                file_size: file.size,
                version: (existingFile?.version ?? 0) + 1,
                updated_by: userId,
            });

            entities.push(entity);
        }

        return await queryRunner.manager.save(ContractFile, entities);
    }

    private isManager(user: HeaderUserPayload): boolean {
        return user.roles?.includes(Role.MANAGER) ?? false;
    }

    // Soft delete contract
    async softDelete(user: HeaderUserPayload, contractId: number) {
        const contract = await this.contractRepo.findOneBy({ id: contractId });
        if (!contract) throw new NotFoundException('Contract not found');

        contract.deleted_at = new Date();
        await this.contractRepo.save(contract);
        return { message: 'Xóa hợp đồng thành công (soft delete)' };
    }

    async updateContract(
        contractId: number,
        body: Partial<CreateContractRequest>,
        files: Express.Multer.File[] = [],
        user: HeaderUserPayload,
    ) {
        const queryRunner: QueryRunner = this.db.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const contract = await this.contractRepo.findOne({ where: { id: contractId } });
            if (!contract) {
                throw new BadRequestException(ERROR_MESSAGES.CONTRACT.NOT_FOUND);
            }

            if (files.length > 0) {
                const duplicateFiles = await this.checkDuplicateFiles(files, contractId);
                if (duplicateFiles.length > 0) {
                    throw new BadRequestException({
                        message: ERROR_MESSAGES.FILE.DUPLICATES,
                        dataError: duplicateFiles,
                    });
                }
                await this.attachFilesToContract(contract.id, files, user.sub, queryRunner);
            }

            const updatedContract = this.contractRepo.merge(contract, {
                ...body,
                updated_by: user.sub,
            });
            const savedContract = await queryRunner.manager.save(updatedContract);

            await queryRunner.commitTransaction();
            const contractFiles = await this.contractFileRepo.find({ where: { contract_id: savedContract.id } });

            return {
                id: savedContract.id,
                code: savedContract.code,
                name: savedContract.name,
                type: savedContract.type,
                description: savedContract.description,
                status: savedContract.status,
                start_date: savedContract.start_date,
                end_date: savedContract.end_date,
                created_by: savedContract.created_by,
                department_id: savedContract.department_id,
                files: contractFiles.map((file) => ({
                    id: file.id,
                    file_name: file.file_name,
                    file_path: `${this.baseUrl}/${file.file_name}`,
                    uploaded_at: file.updated_at,
                })),
            };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.APP.error('Update contract error: ' + err);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    // Update contract status
    async updateStatus(entityType: 'contract' | 'phase' | 'task', id: number, status: string) {
        let repo;
        switch (entityType) {
            case 'contract':
                repo = this.contractRepo;
                break;
            case 'phase':
                repo = this.contractPhaseRepo;
                break;
            case 'task':
                repo = this.taskRepo;
                break;
            default:
                throw new Error(`Invalid entity type: ${entityType}`);
        }

        const entity = await repo.findOneBy({ id });
        if (!entity) throw new NotFoundException(`${entityType} not found`);

        entity.status = status;
        await repo.save(entity);
        return { message: `Update ${entityType} status successfully` };
    }

    async updateContractTask(
        files: Express.Multer.File[] = [],
        contractId: number,
        taskId: number,
        body: Partial<CreateContractTaskRequest> & { status?: TaskStatus; note?: string; report?: string },
        user: HeaderUserPayload,
    ) {
        const task = await this.taskRepo.findOne({ where: { id: taskId, contractId } });
        if (!task) throw new NotFoundException('Task not found');

        const isManager = this.isManager(user);
        const isAssignedStaff = task.assignedToId === user.sub;

        if (isManager) {
            Object.assign(task, body);
        } else if (isAssignedStaff) {
            if (body.status) task.status = body.status;
            if (body.note) task.note = body.note;
            if (body.report) task.note = body.report;

            if (files.length > 0) {
                const contractFolder = this.getContractFolderName(contractId);
                const staffFolder = this.getTaskStaffFolderName(Number(user.sub));
                const uploadDir = `${contractFolder}/${staffFolder}`;

                for (const file of files) {
                    const result = await this.uploadService.upload(file, uploadDir);
                    await this.taskFileRepo.save({
                        taskId: task.id,
                        file_path: `${this.baseUrl}/${uploadDir}/${result.filename}`,
                        file_name: result.originalname,
                        updated_by: user.sub,
                    });
                }
            }
        } else {
            throw new ForbiddenException('You are not authorized to update this task');
        }

        await this.taskRepo.save(task);
        return { message: 'Task updated successfully', task };
    }

    // Delete contract task
    async deleteContractTask(contractId: number, taskId: number) {
        const task = await this.taskRepo.findOneBy({ id: taskId, contractId });
        if (!task) throw new NotFoundException('Task not found');

        await this.taskRepo.remove(task);
    }

    private getContractFolderName(contractId: number): string {
        const hash = crypto.createHash('md5').update(contractId.toString()).digest('hex');
        return `contract-${hash}`;
    }

    private getTaskStaffFolderName(staffId: number): string {
        const hash = crypto.createHash('md5').update(staffId.toString()).digest('hex');
        return `task-${hash}`;
    }

    async findUpcomingContracts(daysBefore: number): Promise<Contract[]> {
        const qb = this.contractRepo.createQueryBuilder('contract');
        const builder = new ContractQueryBuilder(qb).whereStartOrEndDateIn(daysBefore);
        return await builder.getMany();
    }

    async findUpcomingPhases(daysBefore: number): Promise<ContractPhase[]> {
        const qb = this.contractPhaseRepo.createQueryBuilder('phase');
        const builder = new ContractQueryBuilder(qb).wherePhaseStartOrEndDateIn(daysBefore);
        return builder.getMany();
    }

    async findUpcomingTasks(daysBefore: number): Promise<ContractTask[]> {
        const qb = this.taskRepo.createQueryBuilder('task');
        const builder = new ContractQueryBuilder(qb).whereTaskDueDateIn(daysBefore);
        return builder.getMany();
    }

    async findOverdueContracts() {
        const qb = this.taskRepo.createQueryBuilder('contract');
        const builder = new ContractQueryBuilder(qb).whereStartOrEndDatePassed();
        return builder.getMany();
    }

    async findOverduePhases() {
        const qb = this.taskRepo.createQueryBuilder('phase');
        const builder = new ContractQueryBuilder(qb).wherePhaseOverdue();
        return builder.getMany();
    }

    async findOverdueTasks() {
        const qb = this.taskRepo.createQueryBuilder('task');
        const builder = new ContractQueryBuilder(qb).whereTaskOverdue();
        return builder.getMany();
    }

    async findContractRelatedUsers(contractId: number): Promise<number[]> {
        return await ContractQueryBuilder.findRelatedUserIds(contractId, this.db);
    }
    // // Approve contract
    // async approveContract(contractId: number, user: HeaderUserPayload) {
    //     const contract = await this.contractRepo.findOneBy({ id: contractId });
    //     if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');

    //     contract.status = 'APPROVED';
    //     await this.contractRepo.save(contract);
    //     return { message: 'Duyệt hợp đồng thành công' };
    // }

    // // Reject contract
    // async rejectContract(contractId: number, user: HeaderUserPayload) {
    //     const contract = await this.contractRepo.findOneBy({ id: contractId });
    //     if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');
    //     if (user.role !== Role.MANAGER) throw new ForbiddenException('Không có quyền từ chối hợp đồng');

    //     contract.status = 'REJECTED';
    //     await this.contractRepo.save(contract);
    //     return { message: 'Từ chối hợp đồng thành công' };
    // }
}
