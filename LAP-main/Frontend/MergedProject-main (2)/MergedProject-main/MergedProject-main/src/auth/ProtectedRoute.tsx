import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { usePermissions } from './usePermissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  element: React.ReactElement;
  permission?: string;
  module?: string;
  isPlatformAdminRequired?: boolean;
}

export default function ProtectedRoute({ element, permission, module, isPlatformAdminRequired }: ProtectedRouteProps) {
  const auth = useAuth();
  const { hasPermission, isModuleEnabled, isPlatformAdmin } = usePermissions();

  if (!auth) return element;

  const { isAuthenticated, loading } = auth;

  console.log('[ProtectedRoute Debug] Checking path authorization:', {
    path: window.location.pathname,
    isAuthenticated,
    loading,
    isPlatformAdminRequired,
    isPlatformAdmin,
    requiredModule: module,
    isModuleEnabled: module ? isModuleEnabled(module) : 'N/A',
    requiredPermission: permission,
    hasPermission: permission ? hasPermission(permission) : 'N/A',
    userPermissions: auth.permissions,
    userModules: auth.modules,
    userRole: auth.user?.role
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const debugLog = {
      currentPath: window.location.pathname,
      requiredPermission: permission,
      requiredModule: module,
      userPermissions: auth.permissions,
      userModules: auth.modules,
      isPlatformAdmin,
      reason: 'Not authenticated'
    };
    console.warn('[AUTH DEBUG]', debugLog);
    try {
      localStorage.setItem('last_auth_debug_log', JSON.stringify(debugLog));
    } catch (error) {
      console.warn('Auth debug log storage failed:', error);
    }
    return <Navigate to="/login" replace />;
  }

  if (isPlatformAdminRequired && !isPlatformAdmin) {
    const debugLog = {
      currentPath: window.location.pathname,
      requiredPermission: permission,
      requiredModule: module,
      userPermissions: auth.permissions,
      userModules: auth.modules,
      isPlatformAdmin,
      reason: 'Platform Admin check failed'
    };
    console.warn('[AUTH DEBUG]', debugLog);
    try {
      localStorage.setItem('last_auth_debug_log', JSON.stringify(debugLog));
    } catch (error) {
      console.warn('Auth debug log storage failed:', error);
    }
    return <Navigate to="/unauthorized" replace />;
  }

  if (module && !isModuleEnabled(module)) {
    const debugLog = {
      currentPath: window.location.pathname,
      requiredPermission: permission,
      requiredModule: module,
      userPermissions: auth.permissions,
      userModules: auth.modules,
      isPlatformAdmin,
      reason: 'Module check failed'
    };
    console.warn('[AUTH DEBUG]', debugLog);
    try {
      localStorage.setItem('last_auth_debug_log', JSON.stringify(debugLog));
    } catch (error) {
      console.warn('Auth debug log storage failed:', error);
    }
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && !hasPermission(permission)) {
    const debugLog = {
      currentPath: window.location.pathname,
      requiredPermission: permission,
      requiredModule: module,
      userPermissions: auth.permissions,
      userModules: auth.modules,
      isPlatformAdmin,
      reason: 'Permission check failed'
    };
    console.warn('[AUTH DEBUG]', debugLog);
    try {
      localStorage.setItem('last_auth_debug_log', JSON.stringify(debugLog));
    } catch (error) {
      console.warn('Auth debug log storage failed:', error);
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}
