# Redux Store Structure

Cấu trúc Redux được thiết kế theo cách thông thường, dễ maintain và mở rộng.

## 📁 Cấu trúc thư mục

```
src/redux/
├── store.ts                 # Store configuration
├── hooks/                   # Custom hooks
│   ├── index.ts
│   ├── useAppDispatch.ts
│   ├── useAppSelector.ts
│   └── useContract.ts
├── slices/                  # Redux slices
│   ├── auth.slice.ts
│   ├── contract.slice.ts
│   ├── user.slice.ts
│   └── dashboard.slice.ts
├── selectors/               # Selectors
│   └── index.ts
└── middleware/              # Custom middleware (nếu có)
```

## 🏗️ Kiến trúc

### 1. Store Configuration (`store.ts`)
- Cấu hình Redux store với tất cả reducers
- Middleware configuration
- Type definitions cho RootState và AppDispatch

### 2. Slices
Mỗi slice được tổ chức theo cấu trúc chuẩn:

```typescript
// ==================== ASYNC THUNKS ====================
export const fetchData = createAsyncThunk(
    'slice/fetchData',
    async (params) => {
        const response = await service.getData(params);
        return response.data;
    }
);

// ==================== STATE INTERFACE ====================
interface SliceState {
    data: Data[];
    loading: boolean;
    error: string | null;
    // ... other state properties
}

// ==================== INITIAL STATE ====================
const initialState: SliceState = {
    data: [],
    loading: false,
    error: null,
    // ... other initial values
};

// ==================== SLICE ====================
const slice = createSlice({
    name: 'slice',
    initialState,
    reducers: {
        // Synchronous actions
    },
    extraReducers: (builder) => {
        // Async thunk handlers
    },
});
```

### 3. Selectors (`selectors/index.ts`)
- Basic selectors để truy cập state
- Derived selectors sử dụng `createSelector` để memoization
- Permission selectors cho authorization

### 4. Custom Hooks (`hooks/`)
- `useAppDispatch`: Typed dispatch hook
- `useAppSelector`: Typed selector hook
- `useContract`: Domain-specific hook cho contract operations

## 🚀 Cách sử dụng

### Trong Components

```typescript
import { useContract } from '~/redux/hooks';
import { useAppSelector } from '~/redux/hooks';
import { selectContracts, selectContractLoading } from '~/redux/selectors';

const ContractList = () => {
    const {
        contracts,
        loading,
        loadContracts,
        updateFilters,
        clearErrorState
    } = useContract();
    
    // Hoặc sử dụng selectors trực tiếp
    const contracts = useAppSelector(selectContracts);
    const loading = useAppSelector(selectContractLoading);
    
    useEffect(() => {
        loadContracts();
    }, []);
    
    // ... component logic
};
```

### Async Operations

```typescript
const handleCreateContract = async (data) => {
    try {
        await createNewContract(data);
        // Success handling
    } catch (error) {
        // Error handling
    }
};
```

## 📋 Các Slice chính

### 1. Auth Slice (`auth.slice.ts`)
- Quản lý authentication state
- User session management
- Token management
- Login/logout operations

### 2. Contract Slice (`contract.slice.ts`)
- Contract CRUD operations
- Contract creation flow
- Template management
- Stage validation
- Draft management

### 3. User Slice (`user.slice.ts`)
- User management
- User CRUD operations
- User filters và search

### 4. Dashboard Slice (`dashboard.slice.ts`)
- Dashboard statistics
- Analytics data
- Recent activity
- Date range filters

## 🔧 Best Practices

### 1. State Structure
- Tách biệt rõ ràng giữa data, UI state, và metadata
- Sử dụng normalized state cho collections
- Tránh nested state quá sâu

### 2. Actions
- Sử dụng `createAsyncThunk` cho async operations
- Actions có tên mô tả rõ ràng
- Payload types được định nghĩa rõ ràng

### 3. Selectors
- Sử dụng `createSelector` cho derived state
- Memoization để tối ưu performance
- Tách biệt logic business khỏi components

### 4. Error Handling
- Consistent error state structure
- Clear error messages
- Error clearing mechanisms

### 5. Loading States
- Separate loading states cho different operations
- Optimistic updates khi có thể
- Loading indicators cho UX

## 🔄 State Updates

### Optimistic Updates
```typescript
// Trong extraReducers
.addCase(updateContract.fulfilled, (state, action) => {
    state.loading = false;
    state.success = 'Contract updated successfully';
    // Update trong list
    const index = state.contracts.findIndex(c => c.id === action.payload.id);
    if (index !== -1) {
        state.contracts[index] = action.payload;
    }
    // Update current contract nếu đang xem
    if (state.currentContract?.id === action.payload.id) {
        state.currentContract = action.payload;
    }
})
```

### Batch Updates
```typescript
// Sử dụng multiple actions
dispatch(setFilters(newFilters));
dispatch(setPage(1));
dispatch(loadContracts());
```

## 🧪 Testing

### Unit Tests
- Test reducers với different actions
- Test selectors với different state
- Test async thunks với mock services

### Integration Tests
- Test complete workflows
- Test state transitions
- Test error scenarios

## 📈 Performance

### Memoization
- Sử dụng `createSelector` cho expensive computations
- Memoize selectors với dependencies
- Avoid unnecessary re-renders

### Normalization
- Normalize data structures
- Use IDs for relationships
- Avoid duplicate data

## 🔐 Security

### Permission Checks
- Permission selectors cho authorization
- Role-based access control
- Secure data access patterns

### Data Validation
- Validate data trước khi dispatch
- Type safety với TypeScript
- Runtime validation khi cần thiết