import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Contract, ContractTemplate, ContractType } from '../types/contract';

interface ContractState {
  contracts: Contract[];
  currentContract: Contract | null;
  templates: ContractTemplate[];
  recentContracts: Contract[];
  isLoading: boolean;
  error: string | null;
}

interface ContractActions {
  // Contract Management
  createContract: (type: ContractType, template?: ContractTemplate) => Contract;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  setCurrentContract: (contract: Contract | null) => void;
  
  // Template Management
  addTemplate: (template: ContractTemplate) => void;
  updateTemplate: (id: string, updates: Partial<ContractTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Contract Operations
  saveContract: (contract: Contract) => void;
  duplicateContract: (id: string) => Contract;
  exportContract: (id: string, format: string) => void;
  
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Recent Contracts
  addToRecent: (contract: Contract) => void;
  clearRecent: () => void;
  
  // Search and Filter
  searchContracts: (query: string) => Contract[];
  filterContractsByType: (type: ContractType) => Contract[];
  getContractsByStatus: (status: Contract['status']) => Contract[];
}

type ContractStore = ContractState & ContractActions;

const defaultTemplates: ContractTemplate[] = [
  {
    id: 'employment-standard',
    name: 'Standard Employment Contract',
    description: 'Basic employment contract with standard terms and conditions',
    category: 'employment',
    content: `
      <h1>EMPLOYMENT CONTRACT</h1>
      <p><strong>This Employment Contract</strong> (the "Contract") is entered into on [DATE] between:</p>
      
      <h2>EMPLOYER:</h2>
      <p>[COMPANY NAME]<br>
      [ADDRESS]<br>
      [CITY, STATE, ZIP]</p>
      
      <h2>EMPLOYEE:</h2>
      <p>[EMPLOYEE NAME]<br>
      [ADDRESS]<br>
      [CITY, STATE, ZIP]</p>
      
      <h2>1. POSITION AND DUTIES</h2>
      <p>The Employee shall serve as [JOB TITLE] and shall perform all duties and responsibilities associated with this position.</p>
      
      <h2>2. TERM OF EMPLOYMENT</h2>
      <p>This Contract shall commence on [START DATE] and shall continue until terminated by either party in accordance with the terms herein.</p>
      
      <h2>3. COMPENSATION</h2>
      <p>The Employee shall receive a salary of [SALARY AMOUNT] per [PAYMENT PERIOD], payable in accordance with the Company's standard payroll practices.</p>
      
      <h2>4. WORK SCHEDULE</h2>
      <p>The Employee shall work [NUMBER] hours per week, typically from [START TIME] to [END TIME], Monday through Friday.</p>
      
      <h2>5. BENEFITS</h2>
      <p>The Employee shall be eligible for all benefits provided to full-time employees, including health insurance, paid time off, and retirement benefits.</p>
      
      <h2>6. TERMINATION</h2>
      <p>Either party may terminate this Contract with [NOTICE PERIOD] written notice to the other party.</p>
      
      <p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Contract as of the date first above written.</p>
      
      <p><strong>EMPLOYER:</strong><br>
      [SIGNATURE]<br>
      [NAME]<br>
      [TITLE]<br>
      [DATE]</p>
      
      <p><strong>EMPLOYEE:</strong><br>
      [SIGNATURE]<br>
      [NAME]<br>
      [DATE]</p>
    `,
    tags: ['employment', 'standard', 'full-time'],
    createdAt: '2024-01-01'
  }
];

export const useContractStore = create<ContractStore>()(
  persist(
    (set, get) => ({
      // Initial State
      contracts: [],
      currentContract: null,
      templates: defaultTemplates,
      recentContracts: [],
      isLoading: false,
      error: null,

      // Contract Management
      createContract: (type: ContractType, template?: ContractTemplate) => {
        const newContract: Contract = {
          id: Date.now().toString(),
          type,
          content: template?.content || '',
          template: template?.name || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft'
        };

        set((state) => ({
          contracts: [...state.contracts, newContract],
          currentContract: newContract
        }));

        return newContract;
      },

      updateContract: (id: string, updates: Partial<Contract>) => {
        set((state) => ({
          contracts: state.contracts.map(contract =>
            contract.id === id
              ? { ...contract, ...updates, updatedAt: new Date().toISOString() }
              : contract
          ),
          currentContract: state.currentContract?.id === id
            ? { ...state.currentContract, ...updates, updatedAt: new Date().toISOString() }
            : state.currentContract
        }));
      },

      deleteContract: (id: string) => {
        set((state) => ({
          contracts: state.contracts.filter(contract => contract.id !== id),
          currentContract: state.currentContract?.id === id ? null : state.currentContract
        }));
      },

      setCurrentContract: (contract: Contract | null) => {
        set({ currentContract: contract });
      },

      // Template Management
      addTemplate: (template: ContractTemplate) => {
        set((state) => ({
          templates: [...state.templates, template]
        }));
      },

      updateTemplate: (id: string, updates: Partial<ContractTemplate>) => {
        set((state) => ({
          templates: state.templates.map(template =>
            template.id === id
              ? { ...template, ...updates }
              : template
          )
        }));
      },

      deleteTemplate: (id: string) => {
        set((state) => ({
          templates: state.templates.filter(template => template.id !== id)
        }));
      },

      // Contract Operations
      saveContract: (contract: Contract) => {
        const existingIndex = get().contracts.findIndex(c => c.id === contract.id);
        
        if (existingIndex >= 0) {
          // Update existing contract
          set((state) => ({
            contracts: state.contracts.map(c =>
              c.id === contract.id
                ? { ...contract, updatedAt: new Date().toISOString() }
                : c
            )
          }));
        } else {
          // Add new contract
          set((state) => ({
            contracts: [...state.contracts, contract]
          }));
        }

        // Add to recent contracts
        get().addToRecent(contract);
      },

      duplicateContract: (id: string) => {
        const original = get().contracts.find(c => c.id === id);
        if (!original) {
          throw new Error('Contract not found');
        }

        const duplicated: Contract = {
          ...original,
          id: Date.now().toString(),
          title: `${original.metadata?.title || 'Contract'} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft'
        };

        set((state) => ({
          contracts: [...state.contracts, duplicated]
        }));

        return duplicated;
      },

      exportContract: (id: string, format: string) => {
        const contract = get().contracts.find(c => c.id === id);
        if (!contract) {
          set({ error: 'Contract not found' });
          return;
        }

        // Implementation for export functionality
        console.log(`Exporting contract ${id} in ${format} format`);
      },

      // State Management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Recent Contracts
      addToRecent: (contract: Contract) => {
        set((state) => {
          const filtered = state.recentContracts.filter(c => c.id !== contract.id);
          return {
            recentContracts: [contract, ...filtered].slice(0, 10)
          };
        });
      },

      clearRecent: () => {
        set({ recentContracts: [] });
      },

      // Search and Filter
      searchContracts: (query: string) => {
        const { contracts } = get();
        if (!query.trim()) return contracts;

        const lowerQuery = query.toLowerCase();
        return contracts.filter(contract =>
          contract.metadata?.title?.toLowerCase().includes(lowerQuery) ||
          contract.content.toLowerCase().includes(lowerQuery) ||
          contract.type.toLowerCase().includes(lowerQuery)
        );
      },

      filterContractsByType: (type: ContractType) => {
        const { contracts } = get();
        if (type === 'all') return contracts;
        return contracts.filter(contract => contract.type === type);
      },

      getContractsByStatus: (status: Contract['status']) => {
        const { contracts } = get();
        if (!status) return contracts;
        return contracts.filter(contract => contract.status === status);
      }
    }),
    {
      name: 'contract-store',
      partialize: (state) => ({
        contracts: state.contracts,
        templates: state.templates,
        recentContracts: state.recentContracts
      })
    }
  )
);