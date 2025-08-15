import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// ==================== AUTH SELECTORS ====================

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectSessionValid = (state: RootState) => state.auth.isSessionValid;
export const selectTokenExpiry = (state: RootState) => state.auth.tokenExpiry;

// ==================== CONTRACT SELECTORS ====================

export const selectContract = (state: RootState) => state.contract;
export const selectContracts = (state: RootState) => state.contract.contracts;
export const selectCurrentContract = (state: RootState) => state.contract.currentContract;
export const selectContractLoading = (state: RootState) => state.contract.loading;
export const selectContractError = (state: RootState) => state.contract.error;
export const selectContractSuccess = (state: RootState) => state.contract.success;
export const selectContractPagination = (state: RootState) => state.contract.pagination;
export const selectContractFilters = (state: RootState) => state.contract.filters;
export const selectSelectedContracts = (state: RootState) => state.contract.selectedContracts;
export const selectContractDraft = (state: RootState) => state.contract.contractDraft;
export const selectCreationMode = (state: RootState) => state.contract.creationMode;
export const selectCurrentStage = (state: RootState) => state.contract.currentStage;
export const selectStageValidations = (state: RootState) => state.contract.stageValidations;

// Contract templates
export const selectTemplates = (state: RootState) => state.contract.templates;
export const selectCurrentTemplate = (state: RootState) => state.contract.currentTemplate;
export const selectSelectedTemplate = (state: RootState) => state.contract.selectedTemplate;

// Derived selectors
export const selectActiveContracts = createSelector(
    [selectContracts],
    (contracts) => contracts.filter(contract => contract.status === 'active')
);

export const selectPendingContracts = createSelector(
    [selectContracts],
    (contracts) => contracts.filter(contract => contract.status === 'pending_review')
);

export const selectCompletedContracts = createSelector(
    [selectContracts],
    (contracts) => contracts.filter(contract => contract.status === 'completed')
);

export const selectContractById = createSelector(
    [selectContracts, (_state: RootState, id: number) => id],
    (contracts, id) => contracts.find(contract => contract.id === id)
);

export const selectFilteredContracts = createSelector(
    [selectContracts, selectContractFilters],
    (contracts, filters) => {
        let filtered = contracts;
        
        if (filters.status) {
            filtered = filtered.filter(contract => contract.status === filters.status);
        }
        
        if (filters.type) {
            filtered = filtered.filter(contract => contract.type === filters.type);
        }
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(contract => 
                contract.name.toLowerCase().includes(searchLower) ||
                contract.contractCode?.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered;
    }
);

// ==================== USER SELECTORS ====================

export const selectUserState = (state: RootState) => state.user;
export const selectUsers = (state: RootState) => state.user.users;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectUserSuccess = (state: RootState) => state.user.success;
export const selectUserPagination = (state: RootState) => state.user.pagination;
export const selectUserFilters = (state: RootState) => state.user.filters;
export const selectSelectedUsers = (state: RootState) => state.user.selectedUsers;

export const selectUserById = createSelector(
    [selectUsers, (_state: RootState, id: number) => id],
    (users, id) => users.find(user => user.id === id)
);

export const selectFilteredUsers = createSelector(
    [selectUsers, selectUserFilters],
    (users, filters) => {
        let filtered = users;
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }
        
        if (filters.role) {
            filtered = filtered.filter(user => user.role === filters.role);
        }
        
        if (filters.status) {
            filtered = filtered.filter(user => user.status === filters.status);
        }
        
        return filtered;
    }
);

// ==================== DASHBOARD SELECTORS ====================

export const selectDashboard = (state: RootState) => state.dashboard;
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectRecentActivity = (state: RootState) => state.dashboard.recentActivity;
export const selectContractAnalytics = (state: RootState) => state.dashboard.contractAnalytics;
export const selectCurrentContractAnalytics = (state: RootState) => state.dashboard.currentContractAnalytics;
export const selectDateRange = (state: RootState) => state.dashboard.dateRange;
export const selectLastRefreshed = (state: RootState) => state.dashboard.lastRefreshed;
export const selectAutoRefresh = (state: RootState) => state.dashboard.autoRefresh;

export const selectContractAnalyticsById = createSelector(
    [selectContractAnalytics, (_state: RootState, id: number) => id],
    (analytics, id) => analytics[id]
);

// ==================== GLOBAL SELECTORS ====================

export const selectGlobalLoading = createSelector(
    [selectAuthLoading, selectContractLoading, selectUserLoading, selectDashboardLoading],
    (authLoading, contractLoading, userLoading, dashboardLoading) => 
        authLoading || contractLoading || userLoading || dashboardLoading
);

export const selectGlobalError = createSelector(
    [selectAuthError, selectContractError, selectUserError, selectDashboardError],
    (authError, contractError, userError, dashboardError) => 
        authError || contractError || userError || dashboardError
);

// ==================== PERMISSION SELECTORS ====================

export const selectUserPermissions = createSelector(
    [selectUser],
    (user) => user?.permissions || []
);

export const selectCanCreateContract = createSelector(
    [selectUserPermissions],
    (permissions) => permissions.includes('contract:create')
);

export const selectCanEditContract = createSelector(
    [selectUserPermissions],
    (permissions) => permissions.includes('contract:edit')
);

export const selectCanDeleteContract = createSelector(
    [selectUserPermissions],
    (permissions) => permissions.includes('contract:delete')
);

export const selectCanApproveContract = createSelector(
    [selectUserPermissions],
    (permissions) => permissions.includes('contract:approve')
);

export const selectCanManageUsers = createSelector(
    [selectUserPermissions],
    (permissions) => permissions.includes('user:manage')
);