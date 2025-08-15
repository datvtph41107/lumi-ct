import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ==================== TYPES ====================

interface DashboardStats {
    totalContracts: number;
    activeContracts: number;
    pendingContracts: number;
    completedContracts: number;
    totalUsers: number;
    totalTemplates: number;
    recentActivity: Array<{
        id: string;
        type: 'contract_created' | 'contract_updated' | 'contract_approved' | 'user_registered';
        title: string;
        description: string;
        timestamp: string;
        userId: string;
        userName: string;
    }>;
    monthlyStats: Array<{
        month: string;
        contracts: number;
        users: number;
        revenue?: number;
    }>;
}

interface ContractAnalytics {
    contractId: number;
    views: number;
    downloads: number;
    shares: number;
    timeSpent: number;
    completionRate: number;
    stageProgress: Array<{
        stage: string;
        completed: boolean;
        completedAt?: string;
        timeSpent: number;
    }>;
}

// ==================== ASYNC THUNKS ====================

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async () => {
        // TODO: Implement dashboard service
        // const response = await dashboardService.getStats();
        // return response.data;
        return {
            totalContracts: 0,
            activeContracts: 0,
            pendingContracts: 0,
            completedContracts: 0,
            totalUsers: 0,
            totalTemplates: 0,
            recentActivity: [],
            monthlyStats: [],
        } as DashboardStats;
    }
);

export const fetchContractAnalytics = createAsyncThunk(
    'dashboard/fetchContractAnalytics',
    async (contractId: number) => {
        // TODO: Implement dashboard service
        // const response = await dashboardService.getContractAnalytics(contractId);
        // return response.data;
        return {
            contractId,
            views: 0,
            downloads: 0,
            shares: 0,
            timeSpent: 0,
            completionRate: 0,
            stageProgress: [],
        } as ContractAnalytics;
    }
);

export const fetchRecentActivity = createAsyncThunk(
    'dashboard/fetchRecentActivity',
    async (limit: number = 10) => {
        // TODO: Implement dashboard service
        // const response = await dashboardService.getRecentActivity(limit);
        // return response.data;
        return [];
    }
);

// ==================== STATE INTERFACE ====================

interface DashboardState {
    // Dashboard stats
    stats: DashboardStats | null;
    
    // Contract analytics
    contractAnalytics: Record<number, ContractAnalytics>;
    currentContractAnalytics: ContractAnalytics | null;
    
    // Recent activity
    recentActivity: DashboardStats['recentActivity'];
    
    // UI state
    loading: boolean;
    error: string | null;
    
    // Filters
    dateRange: {
        startDate: string;
        endDate: string;
    };
    
    // Refresh state
    lastRefreshed: string | null;
    autoRefresh: boolean;
}

// ==================== INITIAL STATE ====================

const initialState: DashboardState = {
    stats: null,
    contractAnalytics: {},
    currentContractAnalytics: null,
    recentActivity: [],
    loading: false,
    error: null,
    dateRange: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    },
    lastRefreshed: null,
    autoRefresh: false,
};

// ==================== SLICE ====================

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        
        // Date range
        setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
            state.dateRange = action.payload;
        },
        
        // Auto refresh
        setAutoRefresh: (state, action: PayloadAction<boolean>) => {
            state.autoRefresh = action.payload;
        },
        
        // Set current contract analytics
        setCurrentContractAnalytics: (state, action: PayloadAction<number>) => {
            const contractId = action.payload;
            state.currentContractAnalytics = state.contractAnalytics[contractId] || null;
        },
        
        // Clear current contract analytics
        clearCurrentContractAnalytics: (state) => {
            state.currentContractAnalytics = null;
        },
        
        // Update last refreshed
        updateLastRefreshed: (state) => {
            state.lastRefreshed = new Date().toISOString();
        },
    },
    extraReducers: (builder) => {
        // ==================== FETCH DASHBOARD STATS ====================
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
                state.lastRefreshed = new Date().toISOString();
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard stats';
            });
        
        // ==================== FETCH CONTRACT ANALYTICS ====================
        builder
            .addCase(fetchContractAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContractAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.contractAnalytics[action.payload.contractId] = action.payload;
                state.currentContractAnalytics = action.payload;
            })
            .addCase(fetchContractAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch contract analytics';
            });
        
        // ==================== FETCH RECENT ACTIVITY ====================
        builder
            .addCase(fetchRecentActivity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecentActivity.fulfilled, (state, action) => {
                state.loading = false;
                state.recentActivity = action.payload;
            })
            .addCase(fetchRecentActivity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch recent activity';
            });
    },
});

// ==================== EXPORTS ====================

export const {
    clearError,
    setDateRange,
    setAutoRefresh,
    setCurrentContractAnalytics,
    clearCurrentContractAnalytics,
    updateLastRefreshed,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;