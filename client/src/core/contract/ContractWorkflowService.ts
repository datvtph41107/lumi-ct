import { authCore } from '../auth/AuthCore';
import type { User } from '~/types/auth/auth.types';

export interface ContractWorkflowStep {
  id: string;
  name: string;
  description: string;
  requiredRole: string;
  requiredPermissions: string[];
  conditions?: Record<string, any>;
  actions: {
    approve?: boolean;
    reject?: boolean;
    requestChanges?: boolean;
    assign?: boolean;
    comment?: boolean;
  };
  estimatedTime?: number; // in hours
  isOptional?: boolean;
  canSkip?: boolean;
}

export interface ContractWorkflow {
  id: string;
  name: string;
  description: string;
  contractType: string;
  steps: ContractWorkflowStep[];
  maxDuration?: number; // in days
  autoEscalate?: boolean;
  escalationTime?: number; // in hours
}

export interface WorkflowInstance {
  id: string;
  contractId: number;
  workflowId: string;
  currentStep: number;
  status: 'active' | 'completed' | 'cancelled' | 'escalated';
  startedAt: Date;
  completedAt?: Date;
  currentAssignee?: number;
  history: WorkflowStepHistory[];
  metadata?: Record<string, any>;
}

export interface WorkflowStepHistory {
  stepId: string;
  stepName: string;
  assigneeId: number;
  assigneeName: string;
  action: 'approve' | 'reject' | 'request_changes' | 'assign' | 'comment';
  comment?: string;
  timestamp: Date;
  duration?: number; // in hours
}

class ContractWorkflowService {
  private workflows: Map<string, ContractWorkflow> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();

  constructor() {
    this.initializeWorkflows();
  }

  private initializeWorkflows(): void {
    // Employment Contract Workflow
    this.workflows.set('employment_contract', {
      id: 'employment_contract',
      name: 'Quy trình Hợp đồng Lao động',
      description: 'Quy trình chuẩn cho hợp đồng lao động',
      contractType: 'employment',
      maxDuration: 14, // 14 days
      autoEscalate: true,
      escalationTime: 48, // 48 hours
      steps: [
        {
          id: 'draft',
          name: 'Soạn thảo',
          description: 'Tạo và soạn thảo hợp đồng',
          requiredRole: 'contract_creator',
          requiredPermissions: ['contract:create', 'contract:update'],
          actions: { assign: true, comment: true },
          estimatedTime: 4
        },
        {
          id: 'hr_review',
          name: 'Duyệt HR',
          description: 'Phòng nhân sự duyệt nội dung',
          requiredRole: 'hr_staff',
          requiredPermissions: ['contract:review', 'contract:approve'],
          conditions: { department: 'hr' },
          actions: { approve: true, reject: true, requestChanges: true, comment: true },
          estimatedTime: 8
        },
        {
          id: 'legal_review',
          name: 'Duyệt Pháp lý',
          description: 'Phòng pháp chế duyệt tính pháp lý',
          requiredRole: 'contract_reviewer',
          requiredPermissions: ['contract:review', 'contract:approve'],
          conditions: { department: 'legal' },
          actions: { approve: true, reject: true, requestChanges: true, comment: true },
          estimatedTime: 16
        },
        {
          id: 'management_approval',
          name: 'Phê duyệt Quản lý',
          description: 'Quản lý cấp cao phê duyệt cuối cùng',
          requiredRole: 'contract_manager',
          requiredPermissions: ['contract:approve'],
          actions: { approve: true, reject: true, comment: true },
          estimatedTime: 24
        },
        {
          id: 'signature',
          name: 'Ký kết',
          description: 'Ký kết hợp đồng',
          requiredRole: 'contract_manager',
          requiredPermissions: ['contract:approve'],
          actions: { approve: true, comment: true },
          estimatedTime: 2
        }
      ]
    });

    // Financial Contract Workflow
    this.workflows.set('financial_contract', {
      id: 'financial_contract',
      name: 'Quy trình Hợp đồng Tài chính',
      description: 'Quy trình cho hợp đồng tài chính, mua sắm',
      contractType: 'financial',
      maxDuration: 21, // 21 days
      autoEscalate: true,
      escalationTime: 72, // 72 hours
      steps: [
        {
          id: 'draft',
          name: 'Soạn thảo',
          description: 'Tạo và soạn thảo hợp đồng',
          requiredRole: 'contract_creator',
          requiredPermissions: ['contract:create', 'contract:update'],
          actions: { assign: true, comment: true },
          estimatedTime: 8
        },
        {
          id: 'department_review',
          name: 'Duyệt Phòng ban',
          description: 'Phòng ban liên quan duyệt nội dung',
          requiredRole: 'contract_reviewer',
          requiredPermissions: ['contract:review', 'contract:approve'],
          actions: { approve: true, reject: true, requestChanges: true, comment: true },
          estimatedTime: 16
        },
        {
          id: 'accounting_review',
          name: 'Duyệt Kế toán',
          description: 'Phòng kế toán duyệt điều khoản tài chính',
          requiredRole: 'accounting_staff',
          requiredPermissions: ['contract:review', 'contract:approve'],
          conditions: { department: 'accounting' },
          actions: { approve: true, reject: true, requestChanges: true, comment: true },
          estimatedTime: 24
        },
        {
          id: 'legal_review',
          name: 'Duyệt Pháp lý',
          description: 'Phòng pháp chế duyệt tính pháp lý',
          requiredRole: 'contract_reviewer',
          requiredPermissions: ['contract:review', 'contract:approve'],
          conditions: { department: 'legal' },
          actions: { approve: true, reject: true, requestChanges: true, comment: true },
          estimatedTime: 32
        },
        {
          id: 'management_approval',
          name: 'Phê duyệt Quản lý',
          description: 'Quản lý cấp cao phê duyệt cuối cùng',
          requiredRole: 'contract_manager',
          requiredPermissions: ['contract:approve'],
          actions: { approve: true, reject: true, comment: true },
          estimatedTime: 48
        },
        {
          id: 'signature',
          name: 'Ký kết',
          description: 'Ký kết hợp đồng',
          requiredRole: 'contract_manager',
          requiredPermissions: ['contract:approve'],
          actions: { approve: true, comment: true },
          estimatedTime: 4
        }
      ]
    });

    // Service Contract Workflow
    this.workflows.set('service_contract', {
      id: 'service_contract',
      name: 'Quy trình Hợp đồng Dịch vụ',
      description: 'Quy trình cho hợp đồng cung cấp dịch vụ',
      contractType: 'service',
      maxDuration: 10, // 10 days
      autoEscalate: true,
      escalationTime: 48, // 48 hours
      steps: [
        {
          id: 'draft',
          name: 'Soạn thảo',
          description: 'Tạo và soạn thảo hợp đồng',
          requiredRole: 'contract_creator',
          requiredPermissions: ['contract:create', 'contract:update'],
          actions: { assign: true, comment: true },
          estimatedTime: 6
        },
        {
          id: 'technical_review',
          name: 'Duyệt Kỹ thuật',
          description: 'Phòng kỹ thuật duyệt điều khoản dịch vụ',
          requiredRole: 'contract_reviewer',
          requiredPermissions: ['contract:review', 'contract:approve'],
          conditions: { department: 'technical' },
          actions: { approve: true, reject: true, requestChanges: true, comment: true },
          estimatedTime: 16
        },
        {
          id: 'legal_review',
          name: 'Duyệt Pháp lý',
          description: 'Phòng pháp chế duyệt tính pháp lý',
          requiredRole: 'contract_reviewer',
          requiredPermissions: ['contract:review', 'contract:approve'],
          conditions: { department: 'legal' },
          actions: { approve: true, reject: true, requestChanges: true, comment: true },
          estimatedTime: 24
        },
        {
          id: 'management_approval',
          name: 'Phê duyệt Quản lý',
          description: 'Quản lý cấp cao phê duyệt cuối cùng',
          requiredRole: 'contract_manager',
          requiredPermissions: ['contract:approve'],
          actions: { approve: true, reject: true, comment: true },
          estimatedTime: 32
        },
        {
          id: 'signature',
          name: 'Ký kết',
          description: 'Ký kết hợp đồng',
          requiredRole: 'contract_manager',
          requiredPermissions: ['contract:approve'],
          actions: { approve: true, comment: true },
          estimatedTime: 2
        }
      ]
    });
  }

  // ==================== WORKFLOW MANAGEMENT ====================

  getWorkflow(workflowId: string): ContractWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  getWorkflowByContractType(contractType: string): ContractWorkflow | undefined {
    for (const workflow of this.workflows.values()) {
      if (workflow.contractType === contractType) {
        return workflow;
      }
    }
    return undefined;
  }

  getAllWorkflows(): ContractWorkflow[] {
    return Array.from(this.workflows.values());
  }

  // ==================== WORKFLOW INSTANCE MANAGEMENT ====================

  createWorkflowInstance(contractId: number, workflowId: string, userId: number): WorkflowInstance {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const instance: WorkflowInstance = {
      id: `wf_${contractId}_${Date.now()}`,
      contractId,
      workflowId,
      currentStep: 0,
      status: 'active',
      startedAt: new Date(),
      history: [],
      metadata: {}
    };

    this.instances.set(instance.id, instance);
    return instance;
  }

  getWorkflowInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  getWorkflowInstanceByContract(contractId: number): WorkflowInstance | undefined {
    for (const instance of this.instances.values()) {
      if (instance.contractId === contractId) {
        return instance;
      }
    }
    return undefined;
  }

  // ==================== WORKFLOW EXECUTION ====================

  canExecuteStep(instanceId: string, stepId: string, userId: number): boolean {
    const instance = this.getWorkflowInstance(instanceId);
    if (!instance) return false;

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) return false;

    const currentStep = workflow.steps[instance.currentStep];
    if (currentStep.id !== stepId) return false;

    // Check if user has required role and permissions
    const userRoles = authCore.getUserRoles(userId);
    const hasRequiredRole = userRoles.some(ur => ur.roleId === currentStep.requiredRole);

    if (!hasRequiredRole) return false;

    // Check permissions
    for (const permission of currentStep.requiredPermissions) {
      const [resource, action] = permission.split(':');
      if (!authCore.hasPermission(userId, resource, action)) {
        return false;
      }
    }

    return true;
  }

  executeStep(instanceId: string, stepId: string, userId: number, action: string, comment?: string): boolean {
    const instance = this.getWorkflowInstance(instanceId);
    if (!instance) return false;

    if (!this.canExecuteStep(instanceId, stepId, userId)) {
      return false;
    }

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) return false;

    const currentStep = workflow.steps[instance.currentStep];
    const user = this.getUserById(userId);

    // Record step execution
    const stepHistory: WorkflowStepHistory = {
      stepId: currentStep.id,
      stepName: currentStep.name,
      assigneeId: userId,
      assigneeName: user?.full_name || 'Unknown',
      action: action as any,
      comment,
      timestamp: new Date()
    };

    instance.history.push(stepHistory);

    // Handle step completion
    if (action === 'approve') {
      return this.completeStep(instance, workflow);
    } else if (action === 'reject') {
      return this.rejectWorkflow(instance);
    } else if (action === 'request_changes') {
      return this.requestChanges(instance, comment);
    }

    return true;
  }

  private completeStep(instance: WorkflowInstance, workflow: ContractWorkflow): boolean {
    instance.currentStep++;

    if (instance.currentStep >= workflow.steps.length) {
      // Workflow completed
      instance.status = 'completed';
      instance.completedAt = new Date();
    } else {
      // Move to next step
      const nextStep = workflow.steps[instance.currentStep];
      // Auto-assign if possible
      this.autoAssignStep(instance, nextStep);
    }

    return true;
  }

  private rejectWorkflow(instance: WorkflowInstance): boolean {
    instance.status = 'cancelled';
    instance.completedAt = new Date();
    return true;
  }

  private requestChanges(instance: WorkflowInstance, comment?: string): boolean {
    // Go back to draft step
    instance.currentStep = 0;
    return true;
  }

  private autoAssignStep(instance: WorkflowInstance, step: ContractWorkflowStep): void {
    // Auto-assignment logic based on role and availability
    // This would integrate with user management system
    console.log(`Auto-assigning step ${step.id} to appropriate user`);
  }

  // ==================== WORKFLOW MONITORING ====================

  getWorkflowProgress(instanceId: string): {
    currentStep: number;
    totalSteps: number;
    progress: number;
    estimatedCompletion: Date;
    isOverdue: boolean;
  } {
    const instance = this.getWorkflowInstance(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const progress = (instance.currentStep / workflow.steps.length) * 100;
    const estimatedCompletion = this.calculateEstimatedCompletion(instance, workflow);
    const isOverdue = estimatedCompletion < new Date();

    return {
      currentStep: instance.currentStep,
      totalSteps: workflow.steps.length,
      progress,
      estimatedCompletion,
      isOverdue
    };
  }

  private calculateEstimatedCompletion(instance: WorkflowInstance, workflow: ContractWorkflow): Date {
    const startTime = instance.startedAt.getTime();
    let totalEstimatedTime = 0;

    for (let i = 0; i <= instance.currentStep; i++) {
      const step = workflow.steps[i];
      totalEstimatedTime += step.estimatedTime || 0;
    }

    return new Date(startTime + (totalEstimatedTime * 60 * 60 * 1000)); // Convert hours to milliseconds
  }

  // ==================== UTILITY METHODS ====================

  private getUserById(userId: number): User | null {
    // This would integrate with user management system
    return null;
  }

  getWorkflowStatistics(): {
    totalInstances: number;
    activeInstances: number;
    completedInstances: number;
    cancelledInstances: number;
    averageCompletionTime: number;
  } {
    const instances = Array.from(this.instances.values());
    const total = instances.length;
    const active = instances.filter(i => i.status === 'active').length;
    const completed = instances.filter(i => i.status === 'completed').length;
    const cancelled = instances.filter(i => i.status === 'cancelled').length;

    const completedInstances = instances.filter(i => i.status === 'completed' && i.completedAt);
    const averageCompletionTime = completedInstances.length > 0
      ? completedInstances.reduce((sum, instance) => {
          return sum + (instance.completedAt!.getTime() - instance.startedAt.getTime());
        }, 0) / completedInstances.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      totalInstances: total,
      activeInstances: active,
      completedInstances: completed,
      cancelledInstances: cancelled,
      averageCompletionTime
    };
  }
}

export const contractWorkflowService = new ContractWorkflowService();
export default ContractWorkflowService;