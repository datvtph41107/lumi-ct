// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { ContractService } from "../../services/api/contract.service";
// import {
//     Contract,
//     ContractDraft,
//     ContractTemplate,
//     ContractMilestone,
//     ContractTask,
//     ContractFile,
//     ContractVersion,
//     ContractCollaborator,
//     CreateContractRequest,
//     StageData,
//     ContractQueryParams,
//     ContractAnalytics,
//     DashboardStats,
//     Notification,
//     ContractStage,
//     ContractMode,
// } from "../../types/contract/contract.types";

// // Async thunks
// export const createContract = createAsyncThunk("contract/createContract", async (data: CreateContractRequest) => {
//     const response = await ContractService.createContract(data);
//     return response.data;
// });

// export const fetchContracts = createAsyncThunk("contract/fetchContracts", async (params?: ContractQueryParams) => {
//     const response = await ContractService.getContracts(params);
//     return response;
// });

// export const fetchContract = createAsyncThunk("contract/fetchContract", async (id: string) => {
//     const response = await ContractService.getContract(id);
//     return response.data;
// });

// export const updateContract = createAsyncThunk(
//     "contract/updateContract",
//     async ({ id, data }: { id: string; data: Partial<CreateContractRequest> }) => {
//         const response = await ContractService.updateContract(id, data);
//         return response.data;
//     },
// );

// export const deleteContract = createAsyncThunk("contract/deleteContract", async (id: string) => {
//     await ContractService.deleteContract(id);
//     return id;
// });

// export const autoSaveStage = createAsyncThunk("contract/autoSaveStage", async ({ id, stageData }: { id: string; stageData: StageData }) => {
//     const response = await ContractService.autoSaveStage(id, stageData);
//     return response.data;
// });

// export const saveStage = createAsyncThunk(
//     "contract/saveStage",
//     async ({ id, stage, stageData }: { id: string; stage: string; stageData: StageData }) => {
//         const response = await ContractService.saveStage(id, stage, stageData);
//         return response.data;
//     },
// );

// export const transitionStage = createAsyncThunk(
//     "contract/transitionStage",
//     async ({ id, from, to }: { id: string; from: string; to: string }) => {
//         const response = await ContractService.transitionStage(id, from, to);
//         return response.data;
//     },
// );

// export const fetchTemplates = createAsyncThunk(
//     "contract/fetchTemplates",
//     async (params?: { search?: string; type?: string; category?: string; is_active?: boolean }) => {
//         const response = await ContractService.listTemplates(params);
//         return response.data;
//     },
// );

// export const fetchContractAnalytics = createAsyncThunk("contract/fetchContractAnalytics", async (id: string) => {
//     const response = await ContractService.getContractAnalytics(id);
//     return response.data;
// });

// export const fetchDashboardStats = createAsyncThunk("contract/fetchDashboardStats", async () => {
//     const response = await ContractService.getDashboardStats();
//     return response.data;
// });

// // Contract state interface
// interface ContractState {
//     // Contract list
//     contracts: Contract[];
//     pagination: {
//         page: number;
//         limit: number;
//         total: number;
//         total_pages: number;
//     };

//     // Current contract
//     currentContract: Contract | null;
//     currentDraft: ContractDraft | null;

//     // Templates
//     templates: ContractTemplate[];

//     // Contract components
//     milestones: ContractMilestone[];
//     tasks: ContractTask[];
//     files: ContractFile[];
//     versions: ContractVersion[];
//     collaborators: ContractCollaborator[];
//     notifications: Notification[];

//     // Analytics
//     analytics: ContractAnalytics | null;
//     dashboardStats: DashboardStats | null;

//     // UI state
//     loading: boolean;
//     error: string | null;
//     currentStage: ContractStage;
//     selectedMode: ContractMode | null;
//     selectedTemplate: ContractTemplate | null;

//     // Form state
//     formData: any;
//     stageValidation: Record<string, any>;
//     isFormDirty: boolean;
//     lastSavedAt: string | null;
// }

// const initialState: ContractState = {
//     contracts: [],
//     pagination: {
//         page: 1,
//         limit: 10,
//         total: 0,
//         total_pages: 0,
//     },
//     currentContract: null,
//     currentDraft: null,
//     templates: [],
//     milestones: [],
//     tasks: [],
//     files: [],
//     versions: [],
//     collaborators: [],
//     notifications: [],
//     analytics: null,
//     dashboardStats: null,
//     loading: false,
//     error: null,
//     currentStage: ContractStage.TEMPLATE_SELECTION,
//     selectedMode: null,
//     selectedTemplate: null,
//     formData: {},
//     stageValidation: {},
//     isFormDirty: false,
//     lastSavedAt: null,
// };

// const contractSlice = createSlice({
//     name: "contract",
//     initialState,
//     reducers: {
//         // UI Actions
//         setLoading: (state, action: PayloadAction<boolean>) => {
//             state.loading = action.payload;
//         },
//         setError: (state, action: PayloadAction<string | null>) => {
//             state.error = action.payload;
//         },
//         clearError: (state) => {
//             state.error = null;
//         },

//         // Contract Creation Flow
//         setSelectedMode: (state, action: PayloadAction<ContractMode>) => {
//             state.selectedMode = action.payload;
//         },
//         setSelectedTemplate: (state, action: PayloadAction<ContractTemplate | null>) => {
//             state.selectedTemplate = action.payload;
//         },
//         setCurrentStage: (state, action: PayloadAction<ContractStage>) => {
//             state.currentStage = action.payload;
//         },

//         // Form Management
//         updateFormData: (state, action: PayloadAction<any>) => {
//             state.formData = { ...state.formData, ...action.payload };
//             state.isFormDirty = true;
//         },
//         setFormData: (state, action: PayloadAction<any>) => {
//             state.formData = action.payload;
//             state.isFormDirty = false;
//         },
//         resetFormData: (state) => {
//             state.formData = {};
//             state.isFormDirty = false;
//             state.lastSavedAt = null;
//         },
//         setStageValidation: (state, action: PayloadAction<Record<string, any>>) => {
//             state.stageValidation = action.payload;
//         },
//         markFormClean: (state) => {
//             state.isFormDirty = false;
//         },

//         // Contract Management
//         setCurrentContract: (state, action: PayloadAction<Contract | null>) => {
//             state.currentContract = action.payload;
//         },
//         setCurrentDraft: (state, action: PayloadAction<ContractDraft | null>) => {
//             state.currentDraft = action.payload;
//         },

//         // Component Management
//         setMilestones: (state, action: PayloadAction<ContractMilestone[]>) => {
//             state.milestones = action.payload;
//         },
//         addMilestone: (state, action: PayloadAction<ContractMilestone>) => {
//             state.milestones.push(action.payload);
//         },
//         updateMilestone: (state, action: PayloadAction<ContractMilestone>) => {
//             const index = state.milestones.findIndex((m) => m.id === action.payload.id);
//             if (index !== -1) {
//                 state.milestones[index] = action.payload;
//             }
//         },
//         removeMilestone: (state, action: PayloadAction<string>) => {
//             state.milestones = state.milestones.filter((m) => m.id !== action.payload);
//         },

//         setTasks: (state, action: PayloadAction<ContractTask[]>) => {
//             state.tasks = action.payload;
//         },
//         addTask: (state, action: PayloadAction<ContractTask>) => {
//             state.tasks.push(action.payload);
//         },
//         updateTask: (state, action: PayloadAction<ContractTask>) => {
//             const index = state.tasks.findIndex((t) => t.id === action.payload.id);
//             if (index !== -1) {
//                 state.tasks[index] = action.payload;
//             }
//         },
//         removeTask: (state, action: PayloadAction<string>) => {
//             state.tasks = state.tasks.filter((t) => t.id !== action.payload);
//         },

//         setFiles: (state, action: PayloadAction<ContractFile[]>) => {
//             state.files = action.payload;
//         },
//         addFile: (state, action: PayloadAction<ContractFile>) => {
//             state.files.push(action.payload);
//         },
//         removeFile: (state, action: PayloadAction<string>) => {
//             state.files = state.files.filter((f) => f.id !== action.payload);
//         },

//         setVersions: (state, action: PayloadAction<ContractVersion[]>) => {
//             state.versions = action.payload;
//         },
//         addVersion: (state, action: PayloadAction<ContractVersion>) => {
//             state.versions.push(action.payload);
//         },

//         setCollaborators: (state, action: PayloadAction<ContractCollaborator[]>) => {
//             state.collaborators = action.payload;
//         },
//         addCollaborator: (state, action: PayloadAction<ContractCollaborator>) => {
//             state.collaborators.push(action.payload);
//         },
//         removeCollaborator: (state, action: PayloadAction<string>) => {
//             state.collaborators = state.collaborators.filter((c) => c.id !== action.payload);
//         },

//         setNotifications: (state, action: PayloadAction<Notification[]>) => {
//             state.notifications = action.payload;
//         },
//         addNotification: (state, action: PayloadAction<Notification>) => {
//             state.notifications.push(action.payload);
//         },

//         // Reset state
//         resetContractState: (state) => {
//             state.currentContract = null;
//             state.currentDraft = null;
//             state.milestones = [];
//             state.tasks = [];
//             state.files = [];
//             state.versions = [];
//             state.collaborators = [];
//             state.notifications = [];
//             state.analytics = null;
//             state.currentStage = ContractStage.TEMPLATE_SELECTION;
//             state.selectedMode = null;
//             state.selectedTemplate = null;
//             state.formData = {};
//             state.stageValidation = {};
//             state.isFormDirty = false;
//             state.lastSavedAt = null;
//         },

//         // Clear contract data for new creation
//         clearContractData: (state) => {
//             state.currentContract = null;
//             state.currentDraft = null;
//             state.milestones = [];
//             state.tasks = [];
//             state.files = [];
//             state.versions = [];
//             state.collaborators = [];
//             state.notifications = [];
//             state.analytics = null;
//             state.currentStage = ContractStage.TEMPLATE_SELECTION;
//             state.selectedTemplate = null;
//             state.formData = {};
//             state.stageValidation = {};
//             state.isFormDirty = false;
//             state.lastSavedAt = null;
//             // Keep selectedMode for continuity in creation flow
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             // Create Contract
//             .addCase(createContract.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createContract.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentContract = action.payload;
//                 state.contracts.unshift(action.payload);
//             })
//             .addCase(createContract.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to create contract";
//             })

//             // Fetch Contracts
//             .addCase(fetchContracts.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchContracts.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.contracts = action.payload.data;
//                 state.pagination = action.payload.pagination;
//             })
//             .addCase(fetchContracts.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to fetch contracts";
//             })

//             // Fetch Contract
//             .addCase(fetchContract.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchContract.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentContract = action.payload;
//             })
//             .addCase(fetchContract.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to fetch contract";
//             })

//             // Update Contract
//             .addCase(updateContract.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(updateContract.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentContract = action.payload;
//                 const index = state.contracts.findIndex((c) => c.id === action.payload.id);
//                 if (index !== -1) {
//                     state.contracts[index] = action.payload;
//                 }
//             })
//             .addCase(updateContract.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to update contract";
//             })

//             // Delete Contract
//             .addCase(deleteContract.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(deleteContract.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.contracts = state.contracts.filter((c) => c.id !== action.payload);
//                 if (state.currentContract?.id === action.payload) {
//                     state.currentContract = null;
//                 }
//             })
//             .addCase(deleteContract.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to delete contract";
//             })

//             // Auto Save Stage
//             .addCase(autoSaveStage.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(autoSaveStage.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentDraft = action.payload;
//                 state.lastSavedAt = new Date().toISOString();
//                 state.isFormDirty = false;
//             })
//             .addCase(autoSaveStage.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to auto save";
//             })

//             // Save Stage
//             .addCase(saveStage.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(saveStage.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentDraft = action.payload;
//                 state.lastSavedAt = new Date().toISOString();
//                 state.isFormDirty = false;
//             })
//             .addCase(saveStage.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to save stage";
//             })

//             // Transition Stage
//             .addCase(transitionStage.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(transitionStage.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.currentDraft = action.payload;
//             })
//             .addCase(transitionStage.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to transition stage";
//             })

//             // Fetch Templates
//             .addCase(fetchTemplates.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchTemplates.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.templates = action.payload;
//             })
//             .addCase(fetchTemplates.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to fetch templates";
//             })

//             // Fetch Analytics
//             .addCase(fetchContractAnalytics.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchContractAnalytics.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.analytics = action.payload;
//             })
//             .addCase(fetchContractAnalytics.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to fetch analytics";
//             })

//             // Fetch Dashboard Stats
//             .addCase(fetchDashboardStats.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(fetchDashboardStats.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.dashboardStats = action.payload;
//             })
//             .addCase(fetchDashboardStats.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.error.message || "Failed to fetch dashboard stats";
//             });
//     },
// });

// export const {
//     setLoading,
//     setError,
//     clearError,
//     setSelectedMode,
//     setSelectedTemplate,
//     setCurrentStage,
//     updateFormData,
//     setFormData,
//     resetFormData,
//     setStageValidation,
//     markFormClean,
//     setCurrentContract,
//     setCurrentDraft,
//     setMilestones,
//     addMilestone,
//     updateMilestone,
//     removeMilestone,
//     setTasks,
//     addTask,
//     updateTask,
//     removeTask,
//     setFiles,
//     addFile,
//     removeFile,
//     setVersions,
//     addVersion,
//     setCollaborators,
//     addCollaborator,
//     removeCollaborator,
//     setNotifications,
//     addNotification,
//     resetContractState,
//     clearContractData,
// } = contractSlice.actions;

// export default contractSlice.reducer;
