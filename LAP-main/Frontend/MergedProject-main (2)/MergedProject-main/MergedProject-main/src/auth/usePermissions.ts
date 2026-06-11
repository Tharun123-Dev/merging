import { useAuth } from './AuthContext';
import { hasPermission as checkPermission, hasAnyPermission, hasAllPermissions, isPlatformAdmin as checkPlatformAdmin } from './permissionUtils';
import { isModuleEnabled as checkModuleEnabled } from './moduleUtils';

export function usePermissions() {
  const auth = useAuth();
  const permissions = auth?.permissions || [];
  const modules = auth?.modules || [];
  const user = auth?.user || null;

  return {
    permissions,
    modules,
    user,
    role: user?.role || null,
    hasPermission: (perm: string) => checkPermission(permissions, perm),
    hasAnyPermission: (perms: string[]) => hasAnyPermission(permissions, perms),
    hasAllPermissions: (perms: string[]) => hasAllPermissions(permissions, perms),
    isModuleEnabled: (mod: string) => checkModuleEnabled(modules, mod),
    isPlatformAdmin: checkPlatformAdmin(user),
  };
}
