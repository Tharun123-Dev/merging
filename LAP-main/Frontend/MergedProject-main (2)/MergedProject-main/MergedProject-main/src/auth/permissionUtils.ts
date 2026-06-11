import { User } from './AuthContext';

export function hasPermission(permissions: string[] | null, permissionKey: string): boolean {
  if (!permissions || !Array.isArray(permissions)) return false;
  
  const upperKey = permissionKey.toUpperCase();
  const upperPerms = permissions.map(p => p.toUpperCase());

  // Global wildcard
  if (upperPerms.includes('*')) return true;

  // Exact match
  if (upperPerms.includes(upperKey)) return true;

  // Namespace wildcard checks (e.g. USER_* matches USER_VIEW)
  for (const perm of upperPerms) {
    if (perm.endsWith('*')) {
      const prefix = perm.slice(0, -1);
      if (upperKey.startsWith(prefix)) {
        return true;
      }
    }
  }

  // Generic fallback: If the route requires a VIEW permission,
  // grant access if the user has CREATE, UPDATE, DELETE, or MANAGE permission for that entity.
  if (upperKey.endsWith('_VIEW')) {
    const prefix = upperKey.substring(0, upperKey.length - 5);
    const fallbackKeys = [
      `${prefix}_CREATE`,
      `${prefix}_UPDATE`,
      `${prefix}_DELETE`,
      `${prefix}_MANAGE`,
      `${prefix}_WRITE`
    ];
    if (fallbackKeys.some(key => upperPerms.includes(key))) {
      return true;
    }
  }

  return false;
}

export function hasAnyPermission(permissions: string[] | null, keys: string[]): boolean {
  if (!permissions || !Array.isArray(permissions)) return false;
  return keys.some(key => hasPermission(permissions, key));
}

export function hasAllPermissions(permissions: string[] | null, keys: string[]): boolean {
  if (!permissions || !Array.isArray(permissions)) return false;
  return keys.every(key => hasPermission(permissions, key));
}

export function isPlatformAdmin(user: User | null): boolean {
  return !!(user && user.isPlatformAdmin);
}
