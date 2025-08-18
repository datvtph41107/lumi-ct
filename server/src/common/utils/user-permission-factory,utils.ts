import { Department, Role } from '@/core/shared/enums/base.enums';

export enum DepartmentEnum {
    HANH_CHINH = 1,
    KE_TOAN = 2,
}

export class UserPermissionFactory {
    /**
     * Tạo quyền mặc định cho user dựa theo role và phòng ban
     * @param role Vai trò user (Role.STAFF hoặc Role.MANAGER)
     * @param departmentCode code phòng ban (HC: Hành chính, KT: Kế toán)
     */
    static createDefaultPermissions(role: Role, departmentCode: string): Record<string, boolean> {
        if (role === Role.MANAGER) {
            return this.createManagerPermissions();
        } else if (role === Role.STAFF) {
            if (departmentCode === (Department.ADMINISTRATIVE as string)) {
                return this.createStaffHCPermissions();
            } else if (departmentCode === (Department.ACCOUNTING as string)) {
                return this.createStaffKTPermissions();
            }
        }
        return this.createEmptyPermissions();
    }

    private static createManagerPermissions(): Record<string, boolean> {
        return {
            create_contract: true,
            create_report: true,
            read: true,
            update: true,
            delete: true,
            approve: true,
            assign: true,
        };
    }

    private static createStaffHCPermissions(): Record<string, boolean> {
        return {
            create_contract: true,
            create_report: true,
            read: true,
            update: true,
            delete: false,
            approve: false,
            assign: true,
        };
    }

    private static createStaffKTPermissions(): Record<string, boolean> {
        return {
            create_contract: false,
            create_report: true,
            read: true,
            update: true,
            delete: false,
            approve: false,
            assign: false,
        };
    }

    private static createEmptyPermissions(): Record<string, boolean> {
        return {
            create_contract: false,
            create_report: false,
            read: false,
            update: false,
            delete: false,
            approve: false,
            assign: false,
        };
    }
}
