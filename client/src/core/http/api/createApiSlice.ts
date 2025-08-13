import type { SliceCaseReducers } from "@reduxjs/toolkit";
import { BaseApiSliceBuilder, type ApiSliceConfig, type BaseApiState } from "./BaseApiSliceBuilder";

export function createBaseApiState<T>(additionalState?: T): BaseApiState & T {
    return {
        loading: false,
        error: null,
        ...additionalState,
    } as BaseApiState & T;
}

export function createApiSlice<TState extends BaseApiState, TReducers extends SliceCaseReducers<TState>>(
    config: ApiSliceConfig<TState, TReducers>,
) {
    const builder = new BaseApiSliceBuilder(config);
    return builder.buildSlice();
}

export type { BaseApiState } from "./BaseApiSliceBuilder";
