// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import type { ContractTypeStore, CustomContractType } from "~/types/contract-field.types";

// export const useContractTypeStore = create<ContractTypeStore>()(
//     persist(
//         (set, get) => ({
//             customTypes: [],

//             addCustomType: (type) => {
//                 const newType: CustomContractType = {
//                     ...type,
//                     id: `custom_${Date.now()}`,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                 };
//                 set((state) => ({
//                     customTypes: [...state.customTypes, newType],
//                 }));
//             },

//             updateCustomType: (id, updates) => {
//                 set((state) => ({
//                     customTypes: state.customTypes.map((type) => (type.id === id ? { ...type, ...updates, updatedAt: new Date() } : type)),
//                 }));
//             },

//             deleteCustomType: (id) => {
//                 set((state) => ({
//                     customTypes: state.customTypes.filter((type) => type.id !== id),
//                 }));
//             },

//             getCustomType: (id) => {
//                 return get().customTypes.find((type) => type.id === id);
//             },
//         }),
//         {
//             name: "contract-types-storage",
//         },
//     ),
// );
