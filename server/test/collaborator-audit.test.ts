import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CollaboratorService } from '../src/modules/contract/collaborator.service';
import { AuditLogService } from '../src/modules/contract/audit-log.service';
import { PermissionService } from '../src/modules/contract/permission.service';
import { CollaboratorRole } from '../src/core/domain/permission/collaborator-role.enum';

describe('Collaborator and Audit System', () => {
  let module: TestingModule;
  let collaboratorService: CollaboratorService;
  let auditLogService: AuditLogService;
  let permissionService: PermissionService;
  let dataSource: DataSource;

  const mockDataSource = {
    getRepository: jest.fn(),
    createQueryRunner: jest.fn(),
  };

  const mockLogger = {
    APP: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CollaboratorService,
        AuditLogService,
        PermissionService,
        {
          provide: 'DATA_SOURCE',
          useValue: mockDataSource,
        },
        {
          provide: 'LOGGER',
          useValue: mockLogger,
        },
      ],
    }).compile();

    collaboratorService = module.get<CollaboratorService>(CollaboratorService);
    auditLogService = module.get<AuditLogService>(AuditLogService);
    permissionService = module.get<PermissionService>(PermissionService);
    dataSource = module.get<DataSource>('DATA_SOURCE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CollaboratorService', () => {
    const mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    beforeEach(() => {
      mockDataSource.getRepository.mockReturnValue(mockRepository);
    });

    describe('add', () => {
      it('should add new collaborator', async () => {
        const contractId = 'contract-123';
        const userId = 1;
        const role = CollaboratorRole.EDITOR;

        mockRepository.findOne.mockResolvedValue(null);
        mockRepository.create.mockReturnValue({ contract_id: contractId, user_id: userId, role });
        mockRepository.save.mockResolvedValue({ id: 'collab-1', contract_id: contractId, user_id: userId, role });

        const result = await collaboratorService.add(contractId, userId, role);

        expect(result).toEqual({ id: 'collab-1', contract_id: contractId, user_id: userId, role });
        expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { contract_id: contractId, user_id } });
        expect(mockRepository.create).toHaveBeenCalledWith({ contract_id: contractId, user_id, role, active: true });
        expect(mockRepository.save).toHaveBeenCalled();
      });

      it('should update existing collaborator', async () => {
        const contractId = 'contract-123';
        const userId = 1;
        const role = CollaboratorRole.REVIEWER;
        const existing = { id: 'collab-1', contract_id: contractId, user_id: userId, role: CollaboratorRole.VIEWER, active: false };

        mockRepository.findOne.mockResolvedValue(existing);
        mockRepository.save.mockResolvedValue({ ...existing, role, active: true });

        const result = await collaboratorService.add(contractId, userId, role);

        expect(result.role).toBe(role);
        expect(result.active).toBe(true);
      });
    });

    describe('hasRole', () => {
      it('should return true for user with required role', async () => {
        const contractId = 'contract-123';
        const userId = 1;
        const requiredRoles = [CollaboratorRole.OWNER, CollaboratorRole.EDITOR];
        const collaborator = { role: CollaboratorRole.OWNER };

        mockRepository.findOne.mockResolvedValue(collaborator);

        const result = await collaboratorService.hasRole(contractId, userId, requiredRoles);

        expect(result).toBe(true);
      });

      it('should return false for user without required role', async () => {
        const contractId = 'contract-123';
        const userId = 1;
        const requiredRoles = [CollaboratorRole.OWNER];
        const collaborator = { role: CollaboratorRole.VIEWER };

        mockRepository.findOne.mockResolvedValue(collaborator);

        const result = await collaboratorService.hasRole(contractId, userId, requiredRoles);

        expect(result).toBe(false);
      });
    });

    describe('canModifyCollaborator', () => {
      it('should allow owner to modify anyone except themselves', () => {
        const currentUserRole = CollaboratorRole.OWNER;
        const targetUserRole = CollaboratorRole.EDITOR;

        const result = collaboratorService['canModifyCollaborator'](currentUserRole, targetUserRole);

        expect(result).toBe(true);
      });

      it('should not allow owner to modify themselves', () => {
        const currentUserRole = CollaboratorRole.OWNER;
        const targetUserRole = CollaboratorRole.OWNER;

        const result = collaboratorService['canModifyCollaborator'](currentUserRole, targetUserRole);

        expect(result).toBe(false);
      });

      it('should allow editor to modify viewer and reviewer', () => {
        const currentUserRole = CollaboratorRole.EDITOR;
        const targetUserRole = CollaboratorRole.VIEWER;

        const result = collaboratorService['canModifyCollaborator'](currentUserRole, targetUserRole);

        expect(result).toBe(true);
      });

      it('should not allow editor to modify owner', () => {
        const currentUserRole = CollaboratorRole.EDITOR;
        const targetUserRole = CollaboratorRole.OWNER;

        const result = collaboratorService['canModifyCollaborator'](currentUserRole, targetUserRole);

        expect(result).toBe(false);
      });
    });
  });

  describe('AuditLogService', () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    beforeEach(() => {
      mockDataSource.getRepository.mockReturnValue(mockRepository);
    });

    describe('create', () => {
      it('should create audit log successfully', async () => {
        const payload = {
          contract_id: 'contract-123',
          user_id: 1,
          action: 'ADD_COLLABORATOR',
          meta: { addedUserId: 2, role: 'editor' },
          description: 'Thêm collaborator mới',
        };

        const auditLog = { id: 'audit-1', ...payload };
        mockRepository.create.mockReturnValue(auditLog);
        mockRepository.save.mockResolvedValue(auditLog);

        const result = await auditLogService.create(payload);

        expect(result).toEqual(auditLog);
        expect(mockRepository.create).toHaveBeenCalledWith(payload);
        expect(mockRepository.save).toHaveBeenCalledWith(auditLog);
      });

      it('should throw error when action is missing', async () => {
        const payload = {
          contract_id: 'contract-123',
          user_id: 1,
          meta: { addedUserId: 2, role: 'editor' },
        };

        await expect(auditLogService.create(payload)).rejects.toThrow('Action is required to create audit log');
      });
    });

    describe('findByContract', () => {
      it('should return audit logs for contract', async () => {
        const contractId = 'contract-123';
        const auditLogs = [
          { id: 'audit-1', contract_id: contractId, action: 'CREATE_CONTRACT' },
          { id: 'audit-2', contract_id: contractId, action: 'ADD_COLLABORATOR' },
        ];

        mockRepository.find.mockResolvedValue(auditLogs);

        const result = await auditLogService.findByContract(contractId, 100);

        expect(result).toEqual(auditLogs);
        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { contract_id: contractId },
          order: { created_at: 'DESC' },
          take: 100,
        });
      });
    });
  });

  describe('PermissionService', () => {
    beforeEach(() => {
      jest.spyOn(collaboratorService, 'getUserRole').mockImplementation(async (contractId, userId) => {
        if (userId === 1) return CollaboratorRole.OWNER;
        if (userId === 2) return CollaboratorRole.EDITOR;
        if (userId === 3) return CollaboratorRole.REVIEWER;
        if (userId === 4) return CollaboratorRole.VIEWER;
        return null;
      });
    });

    describe('hasPermission', () => {
      it('should return true for owner with any permission', async () => {
        const contractId = 'contract-123';
        const userId = 1; // Owner
        const permission = 'collaborator:add';

        const result = await permissionService.hasPermission(contractId, userId, permission);

        expect(result).toBe(true);
      });

      it('should return false for viewer with restricted permission', async () => {
        const contractId = 'contract-123';
        const userId = 4; // Viewer
        const permission = 'collaborator:add';

        const result = await permissionService.hasPermission(contractId, userId, permission);

        expect(result).toBe(false);
      });

      it('should return false for non-collaborator', async () => {
        const contractId = 'contract-123';
        const userId = 999; // Non-collaborator
        const permission = 'contract:read';

        const result = await permissionService.hasPermission(contractId, userId, permission);

        expect(result).toBe(false);
      });
    });

    describe('canModifyCollaborator', () => {
      it('should allow owner to modify editor', async () => {
        const contractId = 'contract-123';
        const currentUserId = 1; // Owner
        const targetUserId = 2; // Editor

        const result = await permissionService.canModifyCollaborator(contractId, currentUserId, targetUserId);

        expect(result).toBe(true);
      });

      it('should not allow owner to modify themselves', async () => {
        const contractId = 'contract-123';
        const currentUserId = 1; // Owner
        const targetUserId = 1; // Owner

        const result = await permissionService.canModifyCollaborator(contractId, currentUserId, targetUserId);

        expect(result).toBe(false);
      });

      it('should allow editor to modify viewer', async () => {
        const contractId = 'contract-123';
        const currentUserId = 2; // Editor
        const targetUserId = 4; // Viewer

        const result = await permissionService.canModifyCollaborator(contractId, currentUserId, targetUserId);

        expect(result).toBe(true);
      });

      it('should not allow editor to modify owner', async () => {
        const contractId = 'contract-123';
        const currentUserId = 2; // Editor
        const targetUserId = 1; // Owner

        const result = await permissionService.canModifyCollaborator(contractId, currentUserId, targetUserId);

        expect(result).toBe(false);
      });
    });

    describe('getRoleHierarchy', () => {
      it('should return correct hierarchy', () => {
        const hierarchy = permissionService.getRoleHierarchy();

        expect(hierarchy[CollaboratorRole.OWNER]).toBe(4);
        expect(hierarchy[CollaboratorRole.EDITOR]).toBe(3);
        expect(hierarchy[CollaboratorRole.REVIEWER]).toBe(2);
        expect(hierarchy[CollaboratorRole.VIEWER]).toBe(1);
      });
    });

    describe('isHigherRole', () => {
      it('should return true for higher role', () => {
        const result = permissionService.isHigherRole(CollaboratorRole.OWNER, CollaboratorRole.EDITOR);
        expect(result).toBe(true);
      });

      it('should return false for lower role', () => {
        const result = permissionService.isHigherRole(CollaboratorRole.VIEWER, CollaboratorRole.EDITOR);
        expect(result).toBe(false);
      });

      it('should return false for same role', () => {
        const result = permissionService.isHigherRole(CollaboratorRole.EDITOR, CollaboratorRole.EDITOR);
        expect(result).toBe(false);
      });
    });
  });
});