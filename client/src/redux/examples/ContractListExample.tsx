import React, { useEffect, useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectFilteredContracts, selectContractLoading } from '../selectors';

/**
 * Example component demonstrating how to use the Redux contract slice
 * This shows the recommended patterns for using Redux in components
 */
const ContractListExample: React.FC = () => {
    // Method 1: Using custom hook (recommended)
    const {
        contracts,
        loading,
        error,
        success,
        pagination,
        filters,
        loadContracts,
        updateFilters,
        setPageNumber,
        clearErrorState,
        clearSuccessState,
    } = useContract();

    // Method 2: Using selectors directly
    const filteredContracts = useAppSelector(selectFilteredContracts);
    const isLoading = useAppSelector(selectContractLoading);

    // Local state for form inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Load contracts on component mount
    useEffect(() => {
        loadContracts();
    }, [loadContracts]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        updateFilters({ search: value });
    };

    // Handle status filter
    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        updateFilters({ status: status || undefined });
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setPageNumber(page);
        loadContracts();
    };

    // Clear messages after a delay
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => clearErrorState(), 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearErrorState]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => clearSuccessState(), 3000);
            return () => clearTimeout(timer);
        }
    }, [success, clearSuccessState]);

    return (
        <div className="contract-list-example">
            <h2>Contract List Example</h2>
            
            {/* Error and Success Messages */}
            {error && (
                <div className="error-message">
                    Error: {error}
                    <button onClick={clearErrorState}>Dismiss</button>
                </div>
            )}
            
            {success && (
                <div className="success-message">
                    {success}
                    <button onClick={clearSuccessState}>Dismiss</button>
                </div>
            )}

            {/* Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                
                <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Loading State */}
            {loading && <div className="loading">Loading contracts...</div>}

            {/* Contract List */}
            <div className="contract-list">
                {filteredContracts.length === 0 ? (
                    <div className="no-contracts">No contracts found</div>
                ) : (
                    filteredContracts.map((contract) => (
                        <div key={contract.id} className="contract-item">
                            <h3>{contract.name}</h3>
                            <p>Status: {contract.status}</p>
                            <p>Type: {contract.type}</p>
                            {contract.contractCode && (
                                <p>Code: {contract.contractCode}</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="pagination">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                    >
                        Previous
                    </button>
                    
                    <span>
                        Page {pagination.page} of {pagination.total_pages}
                    </span>
                    
                    <button
                        disabled={pagination.page === pagination.total_pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Debug Info */}
            <details className="debug-info">
                <summary>Debug Information</summary>
                <pre>
                    {JSON.stringify(
                        {
                            totalContracts: contracts.length,
                            filteredContracts: filteredContracts.length,
                            currentFilters: filters,
                            pagination,
                            loading: isLoading,
                        },
                        null,
                        2
                    )}
                </pre>
            </details>
        </div>
    );
};

export default ContractListExample;