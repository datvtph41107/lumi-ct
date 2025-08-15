import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import {
    fetchContracts,
    fetchContract,
    createContract,
    updateContract,
    deleteContract,
    submitContractForReview,
    approveContract,
    rejectContract,
    fetchTemplates,
    fetchTemplate,
    setFilters,
    setSearchQuery,
    resetFilters,
    setSelectedContracts,
    toggleContractSelection,
    setCreationMode,
    setCurrentStage,
    updateStageValidation,
    initializeContractDraft,
    updateContractDraft,
    clearContractDraft,
    setPage,
    setLimit,
    clearError,
    clearSuccess,
} from '../slices/contract.slice';
import {
    selectContracts,
    selectCurrentContract,
    selectContractLoading,
    selectContractError,
    selectContractSuccess,
    selectContractPagination,
    selectContractFilters,
    selectSelectedContracts,
    selectContractDraft,
    selectCreationMode,
    selectCurrentStage,
    selectStageValidations,
    selectTemplates,
    selectCurrentTemplate,
    selectFilteredContracts,
    selectActiveContracts,
    selectPendingContracts,
    selectCompletedContracts,
} from '../selectors';

export const useContract = () => {
    const dispatch = useAppDispatch();
    
    // Selectors
    const contracts = useAppSelector(selectContracts);
    const currentContract = useAppSelector(selectCurrentContract);
    const loading = useAppSelector(selectContractLoading);
    const error = useAppSelector(selectContractError);
    const success = useAppSelector(selectContractSuccess);
    const pagination = useAppSelector(selectContractPagination);
    const filters = useAppSelector(selectContractFilters);
    const selectedContracts = useAppSelector(selectSelectedContracts);
    const contractDraft = useAppSelector(selectContractDraft);
    const creationMode = useAppSelector(selectCreationMode);
    const currentStage = useAppSelector(selectCurrentStage);
    const stageValidations = useAppSelector(selectStageValidations);
    const templates = useAppSelector(selectTemplates);
    const currentTemplate = useAppSelector(selectCurrentTemplate);
    const filteredContracts = useAppSelector(selectFilteredContracts);
    const activeContracts = useAppSelector(selectActiveContracts);
    const pendingContracts = useAppSelector(selectPendingContracts);
    const completedContracts = useAppSelector(selectCompletedContracts);
    
    // Actions
    const loadContracts = useCallback((params?: { filters: any; pagination: any }) => {
        return dispatch(fetchContracts(params || { filters, pagination }));
    }, [dispatch, filters, pagination]);
    
    const loadContract = useCallback((id: number) => {
        return dispatch(fetchContract(id));
    }, [dispatch]);
    
    const createNewContract = useCallback((data: any) => {
        return dispatch(createContract(data));
    }, [dispatch]);
    
    const updateExistingContract = useCallback((id: number, data: any) => {
        return dispatch(updateContract({ id, data }));
    }, [dispatch]);
    
    const deleteExistingContract = useCallback((id: number) => {
        return dispatch(deleteContract(id));
    }, [dispatch]);
    
    const submitForReview = useCallback((id: number) => {
        return dispatch(submitContractForReview(id));
    }, [dispatch]);
    
    const approveExistingContract = useCallback((id: number, comment?: string) => {
        return dispatch(approveContract({ id, comment }));
    }, [dispatch]);
    
    const rejectExistingContract = useCallback((id: number, comment?: string) => {
        return dispatch(rejectContract({ id, comment }));
    }, [dispatch]);
    
    const loadTemplates = useCallback((params?: any) => {
        return dispatch(fetchTemplates(params));
    }, [dispatch]);
    
    const loadTemplate = useCallback((id: number) => {
        return dispatch(fetchTemplate(id));
    }, [dispatch]);
    
    const updateFilters = useCallback((newFilters: any) => {
        dispatch(setFilters(newFilters));
    }, [dispatch]);
    
    const updateSearchQuery = useCallback((query: string) => {
        dispatch(setSearchQuery(query));
    }, [dispatch]);
    
    const resetAllFilters = useCallback(() => {
        dispatch(resetFilters());
    }, [dispatch]);
    
    const selectContracts = useCallback((contractIds: number[]) => {
        dispatch(setSelectedContracts(contractIds));
    }, [dispatch]);
    
    const toggleContractSelection = useCallback((contractId: number) => {
        dispatch(toggleContractSelection(contractId));
    }, [dispatch]);
    
    const setMode = useCallback((mode: any) => {
        dispatch(setCreationMode(mode));
    }, [dispatch]);
    
    const setStage = useCallback((stage: any) => {
        dispatch(setCurrentStage(stage));
    }, [dispatch]);
    
    const updateValidation = useCallback((stage: any, validation: any) => {
        dispatch(updateStageValidation({ stage, validation }));
    }, [dispatch]);
    
    const initializeDraft = useCallback((params: any) => {
        dispatch(initializeContractDraft(params));
    }, [dispatch]);
    
    const updateDraft = useCallback((data: any) => {
        dispatch(updateContractDraft(data));
    }, [dispatch]);
    
    const clearDraft = useCallback(() => {
        dispatch(clearContractDraft());
    }, [dispatch]);
    
    const setPageNumber = useCallback((page: number) => {
        dispatch(setPage(page));
    }, [dispatch]);
    
    const setPageLimit = useCallback((limit: number) => {
        dispatch(setLimit(limit));
    }, [dispatch]);
    
    const clearErrorState = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);
    
    const clearSuccessState = useCallback(() => {
        dispatch(clearSuccess());
    }, [dispatch]);
    
    return {
        // State
        contracts,
        currentContract,
        loading,
        error,
        success,
        pagination,
        filters,
        selectedContracts,
        contractDraft,
        creationMode,
        currentStage,
        stageValidations,
        templates,
        currentTemplate,
        filteredContracts,
        activeContracts,
        pendingContracts,
        completedContracts,
        
        // Actions
        loadContracts,
        loadContract,
        createNewContract,
        updateExistingContract,
        deleteExistingContract,
        submitForReview,
        approveExistingContract,
        rejectExistingContract,
        loadTemplates,
        loadTemplate,
        updateFilters,
        updateSearchQuery,
        resetAllFilters,
        selectContracts,
        toggleContractSelection,
        setMode,
        setStage,
        updateValidation,
        initializeDraft,
        updateDraft,
        clearDraft,
        setPageNumber,
        setPageLimit,
        clearErrorState,
        clearSuccessState,
    };
};