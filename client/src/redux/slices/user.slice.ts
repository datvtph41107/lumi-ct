import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '~/types/auth/auth.types';

// ==================== ASYNC THUNKS ====================

export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
        // TODO: Implement user service
        // const response = await userService.getUsers(params);
        // return response.data;
        return { users: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0 } };
    }
);

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (id: number) => {
        // TODO: Implement user service
        // const response = await userService.getUser(id);
        // return response.data;
        return null;
    }
);

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async ({ id, data }: { id: number; data: Partial<User> }) => {
        // TODO: Implement user service
        // const response = await userService.updateUser(id, data);
        // return response.data;
        return null;
    }
);

export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (id: number) => {
        // TODO: Implement user service
        // await userService.deleteUser(id);
        return id;
    }
);

// ==================== STATE INTERFACE ====================

interface UserState {
    // User list
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
    
    // Current user
    currentUser: User | null;
    
    // UI state
    loading: boolean;
    error: string | null;
    success: string | null;
    
    // Filters and search
    filters: {
        search: string;
        role: string;
        status: string;
    };
    
    // Selection state
    selectedUsers: number[];
}

// ==================== INITIAL STATE ====================

const initialState: UserState = {
    users: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
    },
    currentUser: null,
    loading: false,
    error: null,
    success: null,
    filters: {
        search: '',
        role: '',
        status: '',
    },
    selectedUsers: [],
};

// ==================== SLICE ====================

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Clear messages
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        
        // User selection
        setSelectedUsers: (state, action: PayloadAction<number[]>) => {
            state.selectedUsers = action.payload;
        },
        toggleUserSelection: (state, action: PayloadAction<number>) => {
            const userId = action.payload;
            const index = state.selectedUsers.indexOf(userId);
            if (index > -1) {
                state.selectedUsers.splice(index, 1);
            } else {
                state.selectedUsers.push(userId);
            }
        },
        
        // Filters
        setFilters: (state, action: PayloadAction<Partial<UserState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
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
        // ==================== FETCH USERS ====================
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            });
        
        // ==================== FETCH USER ====================
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch user';
            });
        
        // ==================== UPDATE USER ====================
        builder
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'User updated successfully';
                if (action.payload) {
                    const index = state.users.findIndex(u => u.id === action.payload?.id);
                    if (index !== -1) {
                        state.users[index] = action.payload;
                    }
                    if (state.currentUser?.id === action.payload.id) {
                        state.currentUser = action.payload;
                    }
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update user';
            });
        
        // ==================== DELETE USER ====================
        builder
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'User deleted successfully';
                state.users = state.users.filter(u => u.id !== action.payload);
                if (state.currentUser?.id === action.payload) {
                    state.currentUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete user';
            });
    },
});

// ==================== EXPORTS ====================

export const {
    clearError,
    clearSuccess,
    setSelectedUsers,
    toggleUserSelection,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
} = userSlice.actions;

export default userSlice.reducer;