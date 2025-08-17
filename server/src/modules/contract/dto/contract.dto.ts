export interface CreateContractDto {
    name: string;
    contract_code?: string;
    contract_type?: string;
    category?: string;
    priority?: any;
    template_id?: string;
    initial_data?: any;
    content?: any;
}

export interface UpdateContractDto {
    content?: any;
    changes?: string;
}

export interface ContractFilters {
    status?: string;
    type?: string;
    search?: string;
}

export interface ContractPagination {
    page?: number;
    limit?: number;
}