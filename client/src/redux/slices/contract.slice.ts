import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contractService } from '~/services/api/contract.service';
import type {
    Contract,
    ContractDraft,
    ContractTemplate,
    ContractFormData,
    ContractCreationMode,
    ContractCreationStage,
    StageValidation,
    ContractCreationFlow,
    ContractType,
    ContractStatus,
    Priority,
    DateRange,
    ContractMilestone,
    ContractTask,
    ContractFilters,
    ContractPagination,
    ContractListResponse,
} from '~/types/contract/contract.types';

// ==================== ASYNC THUNKS ====================

// Contract CRUD operations
export const fetchContracts = createAsyncThunk(
    'contract/fetchContracts',
    async ({ filters, pagination }: { filters: ContractFilters; pagination: ContractPagination }) => {
        const response = await contractService.listContracts(filters, pagination);
        return response.data;
    }
);

export const fetchContract = createAsyncThunk(
    'contract/fetchContract',
    async (id: number) => {
        const response = await contractService.getContract(id);
        return response.data;
    }
);

export const createContract = createAsyncThunk(
    'contract/createContract',
    async (data: any) => {
        const response = await contractService.createContract(data);
        return response.data;
    }
);

export const updateContract = createAsyncThunk(
    'contract/updateContract',
    async ({ id, data }: { id: number; data: any }) => {
        const response = await contractService.updateContract(id, data);
        return response.data;
    }
);

export const deleteContract = createAsyncThunk(
    'contract/deleteContract',
    async (id: number) => {
        await contractService.deleteContract(id);
        return id;
    }
);

// Contract workflow operations
export const submitContractForReview = createAsyncThunk(
    'contract/submitForReview',
    async (id: number) => {
        const response = await contractService.submitForReview(id);
        return response.data;
    }
);

export const approveContract = createAsyncThunk(
    'contract/approveContract',
    async ({ id, comment }: { id: number; comment?: string }) => {
        const response = await contractService.approveContract(id, comment);
        return response.data;
    }
);

export const rejectContract = createAsyncThunk(
    'contract/rejectContract',
    async ({ id, comment }: { id: number; comment?: string }) => {
        const response = await contractService.rejectContract(id, comment);
        return response.data;
    }
);

// Template operations
export const fetchTemplates = createAsyncThunk(
    'contract/fetchTemplates',
    async (params?: { search?: string; type?: string; category?: string; is_active?: boolean }) => {
        const response = await contractService.listTemplates(params);
        return response.data;
    }
);

export const fetchTemplate = createAsyncThunk(
    'contract/fetchTemplate',
    async (id: number) => {
        const response = await contractService.getTemplate(id);
        return response.data;
    }
);

// ==================== STATE INTERFACE ====================

interface ContractState {
    // Contract list
    contracts: Contract[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
    
    // Current contract
    currentContract: Contract | null;
    
    // Templates
    templates: ContractTemplate[];
    currentTemplate: ContractTemplate | null;
    
    // Contract creation/draft
    contractDraft: ContractDraft | null;
    creationMode: ContractCreationMode | null;
    currentStage: ContractCreationStage | null;
    stageValidations: Record<ContractCreationStage, StageValidation>;
    
    // UI state
    loading: boolean;
    error: string | null;
    success: string | null;
    
    // Filters and search
    filters: ContractFilters;
    searchQuery: string;
    
    // Selection state
    selectedContracts: number[];
    selectedTemplate: number | null;
}

// ==================== INITIAL STATE ====================

const initialState: ContractState = {
    contracts: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
    },
    currentContract: null,
    templates: [],
    currentTemplate: null,
    contractDraft: null,
    creationMode: null,
    currentStage: null,
    stageValidations: {} as Record<ContractCreationStage, StageValidation>,
    loading: false,
    error: null,
    success: null,
    filters: {
        status: undefined,
        type: undefined,
        search: '',
    },
    searchQuery: '',
    selectedContracts: [],
    selectedTemplate: null,
};

// ==================== SLICE ====================

const contractSlice = createSlice({
    name: 'contract',
    initialState,
    reducers: {
        // Clear messages
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        
        // Contract selection
        setSelectedContracts: (state, action: PayloadAction<number[]>) => {
            state.selectedContracts = action.payload;
        },
        toggleContractSelection: (state, action: PayloadAction<number>) => {
            const contractId = action.payload;
            const index = state.selectedContracts.indexOf(contractId);
            if (index > -1) {
                state.selectedContracts.splice(index, 1);
            } else {
                state.selectedContracts.push(contractId);
            }
        },
        
        // Template selection
        setSelectedTemplate: (state, action: PayloadAction<number | null>) => {
            state.selectedTemplate = action.payload;
        },
        
        // Filters and search
        setFilters: (state, action: PayloadAction<Partial<ContractFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.searchQuery = '';
        },
        
        // Contract creation flow
        setCreationMode: (state, action: PayloadAction<ContractCreationMode>) => {
            state.creationMode = action.payload;
        },
        setCurrentStage: (state, action: PayloadAction<ContractCreationStage>) => {
            state.currentStage = action.payload;
        },
        updateStageValidation: (state, action: PayloadAction<{ stage: ContractCreationStage; validation: StageValidation }>) => {
            const { stage, validation } = action.payload;
            state.stageValidations[stage] = validation;
        },
        
        // Contract draft management
        initializeContractDraft: (state, action: PayloadAction<{ mode: ContractCreationMode; templateId?: number }>) => {
            const { mode, templateId } = action.payload;
            state.contractDraft = {
                id: `draft_${Date.now()}`,
                contractData: {
                    name: '',
                    contractType: 'service' as ContractType,
                    milestones: [],
                    mode,
                    currentStage: 'template_selection',
                    isDraft: true,
                } as ContractFormData,
                flow: {
                    id: `flow_${Date.now()}`,
                    currentStage: 'template_selection',
                    stageValidations: {} as Record<ContractCreationStage, StageValidation>,
                    canProceedToNext: false,
                    autoSaveEnabled: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    selectedMode: mode,
                    selectedTemplate: null,
                },
                isDraft: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current_user', // Will be set from auth
            };
            state.creationMode = mode;
            state.currentStage = 'template_selection';
        },
        
        updateContractDraft: (state, action: PayloadAction<Partial<ContractFormData>>) => {
            if (state.contractDraft) {
                state.contractDraft.contractData = {
                    ...state.contractDraft.contractData,
                    ...action.payload,
                };
                state.contractDraft.updatedAt = new Date().toISOString();
            }
        },
        
        clearContractDraft: (state) => {
            state.contractDraft = null;
            state.creationMode = null;
            state.currentStage = null;
            state.stageValidations = {};
        },
        
        // Pagination
        setPage: (state, action: PayloadAction<number>) => {
            state.pagination.page = action.payload;
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.pagination.limit = action.payload;
        },
    },
    extraReducers: (builder) => {
        // ==================== FETCH CONTRACTS ====================
        builder
            .addCase(fetchContracts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContracts.fulfilled, (state, action) => {
                state.loading = false;
                state.contracts = action.payload.contracts;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchContracts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch contracts';
            });
        
        // ==================== FETCH CONTRACT ====================
        builder
            .addCase(fetchContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContract.fulfilled, (state, action) => {
                state.loading = false;
                state.currentContract = action.payload;
            })
            .addCase(fetchContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch contract';
            });
        
        // ==================== CREATE CONTRACT ====================
        builder
            .addCase(createContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createContract.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'Contract created successfully';
                state.contracts.unshift(action.payload);
                state.contractDraft = null;
                state.creationMode = null;
                state.currentStage = null;
            })
            .addCase(createContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create contract';
            });
        
        // ==================== UPDATE CONTRACT ====================
        builder
            .addCase(updateContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateContract.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'Contract updated successfully';
                const index = state.contracts.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.contracts[index] = action.payload;
                }
                if (state.currentContract?.id === action.payload.id) {
                    state.currentContract = action.payload;
                }
            })
            .addCase(updateContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update contract';
            });
        
        // ==================== DELETE CONTRACT ====================
        builder
            .addCase(deleteContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteContract.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'Contract deleted successfully';
                state.contracts = state.contracts.filter(c => c.id !== action.payload);
                if (state.currentContract?.id === action.payload) {
                    state.currentContract = null;
                }
            })
            .addCase(deleteContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete contract';
            });
        
        // ==================== SUBMIT FOR REVIEW ====================
        builder
            .addCase(submitContractForReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitContractForReview.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'Contract submitted for review';
                const index = state.contracts.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.contracts[index] = action.payload;
                }
                if (state.currentContract?.id === action.payload.id) {
                    state.currentContract = action.payload;
                }
            })
            .addCase(submitContractForReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to submit contract';
            });
        
        // ==================== APPROVE CONTRACT ====================
        builder
            .addCase(approveContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveContract.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'Contract approved successfully';
                const index = state.contracts.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.contracts[index] = action.payload;
                }
                if (state.currentContract?.id === action.payload.id) {
                    state.currentContract = action.payload;
                }
            })
            .addCase(approveContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to approve contract';
            });
        
        // ==================== REJECT CONTRACT ====================
        builder
            .addCase(rejectContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectContract.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'Contract rejected';
                const index = state.contracts.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.contracts[index] = action.payload;
                }
                if (state.currentContract?.id === action.payload.id) {
                    state.currentContract = action.payload;
                }
            })
            .addCase(rejectContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to reject contract';
            });
        
        // ==================== FETCH TEMPLATES ====================
        builder
            .addCase(fetchTemplates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.loading = false;
                state.templates = action.payload;
            })
            .addCase(fetchTemplates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch templates';
            });
        
        // ==================== FETCH TEMPLATE ====================
        builder
            .addCase(fetchTemplate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTemplate.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTemplate = action.payload;
            })
            .addCase(fetchTemplate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch template';
            });
    },
});

// ==================== EXPORTS ====================

export const {
    clearError,
    clearSuccess,
    setSelectedContracts,
    toggleContractSelection,
    setSelectedTemplate,
    setFilters,
    setSearchQuery,
    resetFilters,
    setCreationMode,
    setCurrentStage,
    updateStageValidation,
    initializeContractDraft,
    updateContractDraft,
    clearContractDraft,
    setPage,
    setLimit,
} = contractSlice.actions;

export default contractSlice.reducer;
