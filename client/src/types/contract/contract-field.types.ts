export interface ContractField {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
    description?: string;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
    options?: Array<{
        value: string;
        label: string;
    }>;
    defaultValue?: unknown;
    order: number;
}

export type FieldType = "text" | "number" | "date" | "textarea" | "select" | "checkbox" | "radio";

export interface DynamicField {
    id: string;
    label: string;
    placeholder: string;
    type: FieldType;
}

export interface CustomContractType {
    id: string;
    name: string;
    label: string;
    description: string;
    icon: string;
    fields: ContractField[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ContractTypeStore {
    customTypes: CustomContractType[];
    addCustomType: (type: Omit<CustomContractType, "id" | "createdAt" | "updatedAt">) => void;
    updateCustomType: (id: string, type: Partial<CustomContractType>) => void;
    deleteCustomType: (id: string) => void;
    getCustomType: (id: string) => CustomContractType | undefined;
}
