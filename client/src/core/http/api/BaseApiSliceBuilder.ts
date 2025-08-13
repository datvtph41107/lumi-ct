import {
    createSlice,
    createAsyncThunk,
    type SliceCaseReducers,
    type PayloadAction,
    type ActionReducerMapBuilder,
    type CaseReducer,
    type AsyncThunk,
    type ValidateSliceCaseReducers,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { Logger } from "~/core/Logger";

export type ErrorPayload = {
    statusCode?: number;
    message?: string;
};

export type BaseApiState = {
    loading: boolean;
    error: string | null;
};

export type ApiThunk = AsyncThunk<unknown, unknown, { rejectValue: unknown }>;

type BaseReducers<TState> = {
    clearError: CaseReducer<TState>;
    setLoading: CaseReducer<TState, PayloadAction<boolean>>;
    resetState: CaseReducer<TState>;
};

export type ServiceMethod = (...args: any[]) => Promise<{ data: any }>;
export interface ApiSliceConfig<TState extends BaseApiState, TReducers extends SliceCaseReducers<TState>, TService = unknown> {
    name: string;
    initialState: TState;
    serviceThunks?: {
        service: TService;
        methods: ServiceMethod[];
    };
    reducers?: TReducers;
    extraReducers?: (builder: ActionReducerMapBuilder<TState>, thunks: Record<string, ApiThunk>) => void;
    disableDefaultHandlers?: boolean;
}

function isErrorPayload(payload: unknown): payload is ErrorPayload {
    return typeof payload === "object" && payload !== null && ("statusCode" in payload || "message" in payload);
}

export class BaseApiSliceBuilder<TState extends BaseApiState, TReducers extends SliceCaseReducers<TState> = SliceCaseReducers<TState>> {
    private readonly name: string;
    private readonly initialState: TState;
    private readonly serviceThunks?: ApiSliceConfig<TState, TReducers>["serviceThunks"];
    private readonly reducers?: TReducers;
    private readonly extraReducers?: ApiSliceConfig<TState, TReducers>["extraReducers"];
    private readonly disableDefaultHandlers: boolean;
    private readonly logger = Logger.getInstance();

    public readonly thunks: Record<string, ApiThunk> = {};

    constructor(config: ApiSliceConfig<TState, TReducers>) {
        this.name = config.name;
        this.initialState = config.initialState;
        this.serviceThunks = config.serviceThunks;
        this.reducers = config.reducers;
        this.extraReducers = config.extraReducers;
        this.disableDefaultHandlers = config.disableDefaultHandlers ?? false;

        this.createThunks();
    }

    private createThunks() {
        if (this.serviceThunks) {
            const { service, methods } = this.serviceThunks;
            for (const method of methods) {
                const methodName = method.name;
                if (!methodName) {
                    this.logger.error("Service method must be a named function to be used as a thunk.", service);
                    continue;
                }

                type ThunkPayload = Parameters<typeof method>[0];
                type ThunkReturnType = Awaited<ReturnType<typeof method>>["data"];

                this.thunks[methodName] = createAsyncThunk<ThunkReturnType, ThunkPayload, { rejectValue: unknown }>(
                    `${this.name}/${methodName}`,
                    async (payload, { rejectWithValue }) => {
                        try {
                            const response = await method(payload);
                            this.logger.info(`Thunk ${this.name}/${methodName} fulfilled`, response.data);
                            return response.data;
                        } catch (error: unknown) {
                            const axiosError = error as AxiosError;
                            this.logger.error(`Thunk ${this.name}/${methodName} rejected`, {
                                message: axiosError?.message,
                                response: axiosError?.response?.data,
                                status: axiosError?.response?.status,
                            });
                            if (axiosError?.response?.status === 401) {
                                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
                            }
                            return rejectWithValue(axiosError?.response?.data || axiosError?.message || "Unknown error");
                        }
                    },
                ) as ApiThunk;
            }
        } else {
            this.logger.warn(`No serviceThunks provided for slice: ${this.name}. No thunks will be created.`);
        }
    }

    public buildSlice() {
        const baseReducers: BaseReducers<TState> = {
            clearError: (state) => {
                state.error = null;
            },
            setLoading: (state, action: PayloadAction<boolean>) => {
                state.loading = action.payload;
            },
            resetState: (state) => {
                const initial = this.initialState;
                const draft = state as TState;
                for (const key of Object.keys(initial) as Array<keyof TState>) {
                    draft[key] = initial[key];
                }
            },
        };

        const slice = createSlice({
            name: this.name,
            initialState: this.initialState,
            reducers: {
                ...baseReducers,
                ...this.reducers,
            } as ValidateSliceCaseReducers<TState, BaseReducers<TState> & TReducers>,
            extraReducers: (builder) => {
                // Add default handlers first (only if not disabled)
                if (!this.disableDefaultHandlers) {
                    for (const thunk of Object.values(this.thunks)) {
                        builder
                            .addCase(thunk.pending, (state) => {
                                state.loading = true;
                                state.error = null;
                            })
                            .addCase(thunk.fulfilled, (state) => {
                                state.loading = false;
                            })
                            .addCase(thunk.rejected, (state, action) => {
                                state.loading = false;
                                state.error = action.payload as string;
                                if (isErrorPayload(action.payload)) {
                                    if (action.payload.statusCode === 401 || action.payload.message?.toLowerCase().includes("session")) {
                                        // Custom handling if needed
                                    }
                                }
                            });
                    }
                }
                if (this.extraReducers) {
                    this.extraReducers(builder, this.thunks);
                }
            },
        });

        return {
            slice,
            thunks: this.thunks,
            actions: slice.actions,
            reducer: slice.reducer,
        };
    }
}
