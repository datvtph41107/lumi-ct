export interface DepartmentBlockField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'dateRange' | 'select';
    options?: { value: string; label: string }[];
    required?: boolean;
}

export interface DepartmentBlockDefinition {
    code: string; // e.g., 'KT.ACCEPTANCE'
    department: string; // e.g., 'KT'
    title: string;
    description?: string;
    defaultAssignee: 'manager' | 'custom';
    defaultTasks?: { name: string; description?: string }[];
    fields?: DepartmentBlockField[];
}
