export type ContractCreationStage = "template_selection" | "basic_info" | "content_draft" | "milestones_tasks" | "review_preview";

export type StageStatus = "locked" | "incomplete" | "valid" | "invalid";

export interface StageValidation {
    stage: ContractCreationStage;
    status: StageStatus;
    errors: string[]; // Mảng lỗi validate cụ thể từng stage
    warnings: string[]; // Cảnh báo, không chặn bước
    isAccessible: boolean; // Quyền truy cập stage này
    completedAt?: string; // Thời gian hoàn thành stage (có thể dùng để log)
    validatedData?: Record<string, unknown>; // Dữ liệu đã validate hoặc summary
}

export interface ContractCreationFlow {
    id: string;
    currentStage: ContractCreationStage;
    stageValidations: Record<ContractCreationStage, StageValidation>;
    canProceedToNext: boolean; // Điều kiện cho next bước
    autoSaveEnabled: boolean;
    lastAutoSave?: string; // timestamp auto-save
    createdAt: string;
    updatedAt: string;
}
