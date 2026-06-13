import { useAuth } from './AuthContext';
import { hasPermission as checkPermission, hasAnyPermission, hasAllPermissions, isPlatformAdmin as checkPlatformAdmin } from './permissionUtils';
import { isModuleEnabled as checkModuleEnabled } from './moduleUtils';

const MODULE_PERMISSIONS_MAP: Record<string, string[]> = {
  hrms: [
    'ATTENDANCE_VIEW', 'ATTENDANCE_CREATE', 'ATTENDANCE_UPDATE', 'ATTENDANCE_MANAGE',
    'LEAVE_VIEW', 'LEAVE_CREATE', 'LEAVE_UPDATE', 'LEAVE_MANAGE',
    'PAYROLL_VIEW', 'PAYROLL_MANAGE', 'SALARY_VIEW', 'PAYSLIP_VIEW',
    'EMPLOYEE_VIEW', 'DEPARTMENT_VIEW', 'SETTINGS_MANAGE'
  ],
  crm: [
    'LEAD_VIEW', 'LEAD_CREATE', 'LEAD_UPDATE', 'LEAD_DELETE', 'LEAD_MANAGE',
    'CRM_VIEW', 'CRM_MANAGE'
  ],
  affiliate: [
    'AFFILIATE_VIEW', 'AFFILIATE_MANAGE'
  ],
  tasks: [
    'TASK_VIEW', 'TASK_CREATE', 'TASK_UPDATE', 'TASK_MANAGE'
  ],
  tickets: [
    'SUPPORT_TICKET_VIEW', 'SUPPORT_TICKET_CREATE', 'SUPPORT_TICKET_UPDATE', 'SUPPORT_TICKET_MANAGE',
    'raise_support_ticket', 'view_support_tickets', 'manage_support_tickets', 'manage_support_ticket_types', 'SUPPORT_VIEW'
  ],
  'self-reports': [
    'REPORT_SELF', 'SELF_REPORTS_VIEW'
  ],
  reports: [
    'REPORT_VIEW', 'REPORTS_VIEW', 'REPORT_EXPORT'
  ],
  revenue: [
    'REVENUE_VIEW'
  ],
  vendor: [
    'VENDOR_VIEW', 'VENDOR_MANAGE', 'VENDOR_CREATE', 'VENDOR_UPDATE', 'VENDOR_DELETE', 'VENDOR_APPROVE'
  ]
};

export function usePermissions() {
  const auth = useAuth();
  const rawPermissions = auth?.permissions || [];
  const modules = auth?.modules || [];
  const user = auth?.user || null;
  const normalizedRole = String(user?.role || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const isSuperAdmin =
    checkPlatformAdmin(user) ||
    ['SUPER_ADMIN', 'SUPERADMIN', 'PLATFORM_ADMIN', 'SYSTEM_ADMIN'].includes(normalizedRole);
  const permissions = isSuperAdmin ? ['*'] : rawPermissions;

  return {
    permissions,
    modules,
    user,
    role: user?.role || null,
    hasPermission: (perm: string) => checkPermission(permissions, perm),
    hasAnyPermission: (perms: string[]) => hasAnyPermission(permissions, perms),
    hasAllPermissions: (perms: string[]) => hasAllPermissions(permissions, perms),
    isModuleEnabled: (mod: string) => {
      if (isSuperAdmin) return true;
      const modLower = String(mod || '').toLowerCase();
      if (MODULE_PERMISSIONS_MAP[modLower]) {
        return MODULE_PERMISSIONS_MAP[modLower].some((p) => permissions.includes(p));
      }
      return checkModuleEnabled(modules, mod);
    },
    isPlatformAdmin: isSuperAdmin,
  };
}
