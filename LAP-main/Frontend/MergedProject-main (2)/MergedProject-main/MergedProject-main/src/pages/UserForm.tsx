/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Users, Sparkles, UserPlus } from 'lucide-react';
import rolesApi from '@/services/rolesApi';
import EntityFormPage from '@/components/shared/EntityFormPage';

interface Role {
  id: number;
  name: string;
  active: boolean;
}

interface Supervisor {
  id: number;
  name: string;
}

interface LookupEntity {
  id: number;
  name: string;
}


interface BusinessEntity {
  id: number;
  entityCode: string;
  companyName: string;
  active: boolean;
  showInUserForm?: boolean;
}

interface Department {
  id: number;
  deptCode: string;
  deptName: string;
  active: boolean;
  showInUserForm?: boolean;
}

interface Permission {
  id: number;
  module: string;
  action: string;
  permissionKey: string;
  description: string;
  active: boolean;
}

const normalizePermissionKey = (value: unknown) =>
  String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const permissionCodesFromUser = (user: Record<string, unknown>) => {
  const raw =
    user.explicitPermissions ||
    user.assignedPermissions ||
    user.userPermissions ||
    user.assignedPermissionCodes ||
    user.permissionCodes ||
    user.permissions ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        return record.permissionKey || record.code || record.name || record.authority || '';
      }
      return '';
    })
    .map(normalizePermissionKey)
    .filter(Boolean);
};

const selectedPermissionIdsFromUser = (user: Record<string, unknown>, permissions: Permission[]) => {
  const role = normalizePermissionKey(user.roleName || user.role || '');
  const isAdminRole = role.includes('ADMIN') || role === 'SUPER_ADMIN' || role === 'SUPERADMIN';
  const codes = permissionCodesFromUser(user);
  if (codes.length > 0) {
    const codeSet = new Set(codes);
    const mappedIds = permissions
      .filter((permission) => codeSet.has(normalizePermissionKey(permission.permissionKey)))
      .map((permission) => permission.id);
    if (!isAdminRole && mappedIds.length === permissions.length) {
      return [];
    }
    return mappedIds;
  }

  const ids = Array.isArray(user.permissionIds) ? user.permissionIds : [];
  const mappedIds = ids
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && permissions.some((permission) => permission.id === id));
  if (!isAdminRole && mappedIds.length === permissions.length) {
    return [];
  }
  return mappedIds;
};

interface UserFormProps {
  userId?: number | null;
  onClose?: () => void;
}
const mockPermissions: Permission[] = [
  // Vendor Module
  { id: 1, module: 'Vendor', action: 'View Vendors', permissionKey: 'VENDOR_VIEW', description: 'Can view vendors directory and profile details', active: true },
  { id: 2, module: 'Vendor', action: 'Create Vendor', permissionKey: 'VENDOR_CREATE', description: 'Can onboard new vendors', active: true },
  { id: 3, module: 'Vendor', action: 'Update Vendor', permissionKey: 'VENDOR_UPDATE', description: 'Can modify vendor profiles and contracts', active: true },
  { id: 4, module: 'Vendor', action: 'Delete Vendor', permissionKey: 'VENDOR_DELETE', description: 'Can archive or remove vendor records', active: true },
  { id: 5, module: 'Vendor', action: 'Approve Vendor Contracts', permissionKey: 'VENDOR_APPROVE', description: 'Can approve vendor agreements', active: true },

  // PO Module
  { id: 10, module: 'PO', action: 'View POs', permissionKey: 'PO_VIEW', description: 'Can view purchase orders', active: true },
  { id: 11, module: 'PO', action: 'Create PO', permissionKey: 'PO_CREATE', description: 'Can draft and issue new purchase orders', active: true },
  { id: 12, module: 'PO', action: 'Update PO', permissionKey: 'PO_UPDATE', description: 'Can edit pending purchase orders', active: true },
  { id: 13, module: 'PO', action: 'Delete PO', permissionKey: 'PO_DELETE', description: 'Can cancel or remove purchase orders', active: true },
  { id: 14, module: 'PO', action: 'Approve PO', permissionKey: 'PO_APPROVE', description: 'Can release purchase order budgets', active: true },

  // Performance Module
  { id: 20, module: 'Performance', action: 'View Reviews', permissionKey: 'PERFORMANCE_VIEW', description: 'Can view employee performance reviews', active: true },
  { id: 21, module: 'Performance', action: 'Create Review', permissionKey: 'PERFORMANCE_CREATE', description: 'Can initiate a review cycle or submit feedback', active: true },
  { id: 22, module: 'Performance', action: 'Update Review', permissionKey: 'PERFORMANCE_UPDATE', description: 'Can edit review drafts and parameters', active: true },
  { id: 23, module: 'Performance', action: 'Delete Review', permissionKey: 'PERFORMANCE_DELETE', description: 'Can remove performance assessments', active: true },

  // Marketing Module
  { id: 30, module: 'Marketing', action: 'View Campaigns', permissionKey: 'MARKETING_VIEW', description: 'Can view marketing campaigns and analytics', active: true },
  { id: 31, module: 'Marketing', action: 'Create Campaign', permissionKey: 'MARKETING_CREATE', description: 'Can set up marketing leads and campaign pipelines', active: true },
  { id: 32, module: 'Marketing', action: 'Update Campaign', permissionKey: 'MARKETING_UPDATE', description: 'Can tweak running campaigns and followup parameters', active: true },
  { id: 33, module: 'Marketing', action: 'Delete Campaign', permissionKey: 'MARKETING_DELETE', description: 'Can clean up obsolete marketing materials', active: true },

  // Tenant Module
  { id: 40, module: 'Tenant', action: 'View Tenants', permissionKey: 'TENANT_VIEW', description: 'Can inspect active platform tenant spaces', active: true },
  { id: 41, module: 'Tenant', action: 'Create Tenant', permissionKey: 'TENANT_CREATE', description: 'Can provision new tenant workspaces', active: true },
  { id: 42, module: 'Tenant', action: 'Update Tenant', permissionKey: 'TENANT_UPDATE', description: 'Can update billing plans or features of tenants', active: true },
  { id: 43, module: 'Tenant', action: 'Delete Tenant', permissionKey: 'TENANT_DELETE', description: 'Can suspend or delete tenant instances', active: true },

  // User Module
  { id: 50, module: 'User', action: 'View Users', permissionKey: 'USER_VIEW', description: 'Can browse the organization user directory', active: true },
  { id: 51, module: 'User', action: 'Create User', permissionKey: 'USER_CREATE', description: 'Can onboard new employee profiles', active: true },
  { id: 52, module: 'User', action: 'Update User', permissionKey: 'USER_UPDATE', description: 'Can modify user details and permission matrix', active: true },
  { id: 53, module: 'User', action: 'Delete User', permissionKey: 'USER_DELETE', description: 'Can terminate user accounts and roles', active: true },
];


export default function UserForm({ userId, onClose }: UserFormProps = {}) {
  const { id: paramId } = useParams();
  const activeId = userId !== undefined ? userId : (paramId ? Number(paramId) : null);
  const isEdit = Boolean(activeId);
  const navigate = useNavigate();

  // Core user fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('MALE');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [supervisorUserId, setSupervisorUserId] = useState('');
  const [profileData, setProfileData] = useState<Record<string, unknown>>({});
  // Employee Profile states
  const [employeeId, setEmployeeId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeTypeId, setEmployeeTypeId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [workModeId, setWorkModeId] = useState('');

  // Lookup fields list
  const [roles, setRoles] = useState<Role[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [availableEmployeeTypes, setAvailableEmployeeTypes] = useState<LookupEntity[]>([]);
  const [availableDesignations, setAvailableDesignations] = useState<LookupEntity[]>([]);
  const [availableWorkModes, setAvailableWorkModes] = useState<LookupEntity[]>([]);

  // Permissions and structural assignments
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [availableEntities, setAvailableEntities] = useState<BusinessEntity[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch roles and (if editing) user details
  useEffect(() => {
    const ctrl = new AbortController();

    const fetchInitialData = async () => {
      try {
        let fetchedRoles: Role[] = [];
        try {
          const rolesRes = await rolesApi.get<Role[]>('/roles', { signal: ctrl.signal });
          fetchedRoles = rolesRes.data.filter((r) => r.active);
        } catch (err: any) {
          if (err?.name === 'CanceledError') throw err;
          console.warn('Backend roles endpoint failed, falling back to mock roles:', err);

        }
        setRoles(fetchedRoles);

        // Fetch permissions
        let fetchedPerms: Permission[] = [];
        try {
          const permsRes = await rolesApi.get<Permission[]>('/permissions', { signal: ctrl.signal });
          fetchedPerms = permsRes.data || [];
        } catch (err: any) {
          if (err?.name === 'CanceledError') throw err;
          console.warn('Backend permissions endpoint failed, falling back to mock permissions:', err);

        }
        setAvailablePermissions(fetchedPerms);

        // Fetch Business Entities
        let fetchedEntities: BusinessEntity[] = [];
        try {
          const entRes = await rolesApi.get<BusinessEntity[]>('/business-entities/active', { signal: ctrl.signal })
            .catch(() => rolesApi.get<BusinessEntity[]>('/business-entities', { signal: ctrl.signal }));
          fetchedEntities = entRes.data || [];
        } catch (err: any) {
          if (err?.name === 'CanceledError') throw err;
          console.warn('Backend entities endpoint failed, falling back to mock entities:', err);

        }
        setAvailableEntities(fetchedEntities.filter((e) => e.showInUserForm !== false));

        // Fetch Departments
        let fetchedDepartments: Department[] = [];
        try {
          const deptRes = await rolesApi.get<Department[]>('/departments/active', { signal: ctrl.signal })
            .catch(() => rolesApi.get<Department[]>('/departments', { signal: ctrl.signal }));
          fetchedDepartments = deptRes.data || [];
        } catch (err: any) {
          if (err?.name === 'CanceledError') throw err;
          console.warn('Backend departments endpoint failed, falling back to mock departments:', err);

        }
        setAvailableDepartments(fetchedDepartments.filter((d) => d.showInUserForm !== false));

        // Fetch other lookups
        try {
          const [empRes, desRes, wmRes] = await Promise.all([
            rolesApi.get<LookupEntity[]>('/employee-types/active', { signal: ctrl.signal }).catch(() => ({ data: [] })),
            rolesApi.get<LookupEntity[]>('/designations/active', { signal: ctrl.signal }).catch(() => ({ data: [] })),
            rolesApi.get<LookupEntity[]>('/work-modes/active', { signal: ctrl.signal }).catch(() => ({ data: [] }))
          ]);
          setAvailableEmployeeTypes(empRes.data || []);
          setAvailableDesignations(desRes.data || []);
          setAvailableWorkModes(wmRes.data || []);
        } catch (e) {
          console.warn('Failed to fetch lookups', e);
        }

        if (isEdit) {
          try {
            const userRes = await rolesApi.get(`/users/${activeId}`, { signal: ctrl.signal });
            const u = userRes.data;
            setFirstName(u.firstName || '');
            setLastName(u.lastName || '');
            setEmail(u.email || '');
            setPhoneNumber(u.phoneNumber || '');
            setGender(u.gender || 'MALE');
            setSelectedRoleId(u.roleId ? String(u.roleId) : '');
            setSupervisorUserId(u.supervisorUserId ? String(u.supervisorUserId) : '');
            setSupervisorUserId(u.supervisorUserId ? String(u.supervisorUserId) : '');

            setEmployeeId(u.employeeId || '');
            setDateOfBirth(u.dateOfBirth ? String(u.dateOfBirth).split('T')[0] : '');
            setJoiningDate(u.joiningDate ? String(u.joiningDate).split('T')[0] : new Date().toISOString().split('T')[0]);
            setEmployeeTypeId(u.employeeTypeId ? String(u.employeeTypeId) : '');
            setDesignationId(u.designationId ? String(u.designationId) : '');
            setWorkModeId(u.workModeId ? String(u.workModeId) : '');

            // Load only explicitly assigned user-level permissions.
            setSelectedPermissions(selectedPermissionIdsFromUser(u, fetchedPerms));
            setSelectedEntityIds(u.entityIds || []);
            setSelectedDepartmentIds(u.departmentIds || []);
          } catch (err: any) {
            if (err?.name === 'CanceledError') throw err;
            console.error('Failed to fetch user data for edit:', err);
            showToast('error', 'Failed to fetch user data for editing.');
          }
        }
      } catch (err: unknown) {
        const axiosError = err as { name?: string; message?: string };
        if (axiosError.name === 'CanceledError') return;
        showToast('error', 'Failed to load initial form data.');
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
    return () => ctrl.abort();
  }, [activeId, isEdit, showToast]);

  // Load supervisors whenever selected Role ID changes
  useEffect(() => {
    if (!selectedRoleId) {
      setSupervisors([]);
      return;
    }

    const ctrl = new AbortController();

    const loadRoleSpecificDetails = async () => {
      try {
        const supRes = await rolesApi.get<Supervisor[]>(`/users/supervisors?roleId=${selectedRoleId}`, { signal: ctrl.signal });
        setSupervisors(supRes.data || []);
      } catch (err: unknown) {
        const axiosError = err as { name?: string };
        if (axiosError.name === 'CanceledError') return;
        setSupervisors([]);
      }
    };

    loadRoleSpecificDetails();
    return () => ctrl.abort();
  }, [selectedRoleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      roleId: selectedRoleId ? parseInt(selectedRoleId, 10) : null,
      supervisorUserId: supervisorUserId ? parseInt(supervisorUserId, 10) : null,
      employeeId: employeeId || null,
      dateOfBirth: dateOfBirth || null,
      joiningDate: joiningDate || null,
      employeeTypeId: employeeTypeId ? parseInt(employeeTypeId, 10) : null,
      designationId: designationId ? parseInt(designationId, 10) : null,
      workModeId: workModeId ? parseInt(workModeId, 10) : null,

      permissionIds: selectedPermissions,
      entityIds: selectedEntityIds,
      departmentIds: selectedDepartmentIds,
      ...(isEdit ? {} : { password }),
    };

    try {
      if (isEdit) {
        await rolesApi.put(`/users/${activeId}`, payload);
      } else {
        await rolesApi.post('/users', payload);
      }
      showToast('success', isEdit ? 'User details updated successfully.' : 'User onboarded successfully.');
      if (onClose) {
        setTimeout(onClose, 1000);
      } else {
        setTimeout(() => navigate('/users'), 1000);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } | string }; message?: string };
      let errorMsg = 'Failed to save user.';
      if (axiosError.response) {
        if (typeof axiosError.response.data === 'object' && axiosError.response.data?.message) {
          errorMsg = axiosError.response.data.message;
        } else if (typeof axiosError.response.data === 'string') {
          errorMsg = axiosError.response.data;
        }
      } else if (axiosError.message) {
        errorMsg = axiosError.message;
      }
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };


  if (fetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={onClose ? "w-full" : "max-w-4xl mx-auto space-y-6"}>
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 ${toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-455'
            }`}
          role="alert"
        >
          {toast.msg}
        </div>
      )}

      {/* Decorative Header */}
      {!onClose && (
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {isEdit ? 'Modify Personnel Profile' : 'Onboard New Identity'}
            </h2>
            <p className="text-muted-foreground text-xs">
              Establish access clearance, credentials, and reporting chain layout.
            </p>
          </div>
        </div>
      )}

      <EntityFormPage
        title={isEdit ? 'Edit User' : 'Create User'}
        onSubmit={handleSubmit}
        loading={loading}
        isModal={Boolean(onClose)}
        onBack={onClose}
      >
        <div className="space-y-6">
          {/* Section: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul"
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sharma"
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEdit}
                />
                {isEdit && (
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Email address cannot be edited once user has been registered.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9100000000"
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Employee Profile Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" /> Employee Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEdit && employeeId && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-muted/50 border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none cursor-not-allowed"
                    value={employeeId}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Generated by backend</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Employee Type
                </label>
                <select
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={employeeTypeId}
                  onChange={(e) => setEmployeeTypeId(e.target.value)}
                >
                  <option value="">Select Employee Type...</option>
                  {availableEmployeeTypes.map((et) => (
                    <option key={et.id} value={et.id}>{et.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Designation
                </label>
                <select
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={designationId}
                  onChange={(e) => setDesignationId(e.target.value)}
                >
                  <option value="">Select Designation...</option>
                  {availableDesignations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Work Mode
                </label>
                <select
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={workModeId}
                  onChange={(e) => setWorkModeId(e.target.value)}
                >
                  <option value="">Select Work Mode...</option>
                  {availableWorkModes.map((wm) => (
                    <option key={wm.id} value={wm.id}>{wm.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Role & Access Chain */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" /> Role & System Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Access Role <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                >
                  <option value="">Select a role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {supervisors.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Reporting Supervisor
                  </label>
                  <select
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    value={supervisorUserId}
                    onChange={(e) => setSupervisorUserId(e.target.value)}
                  >
                    <option value="">No supervisor (reporting endpoint)</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section: Business Entities */}
          {availableEntities.length > 0 && (
            <>
              <hr className="border-border" />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                  Assign Business Entities
                </h3>
                <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-xl border border-border">
                  {availableEntities.map((en) => {
                    const isChecked = selectedEntityIds.includes(en.id);
                    return (
                      <label
                        key={en.id}
                        className="flex items-center gap-2 bg-background hover:bg-muted/50 px-3 py-2 rounded-lg border border-border cursor-pointer transition-colors text-xs font-semibold text-foreground animate-none"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-input text-primary focus:ring-1 focus:ring-primary w-4 h-4 cursor-pointer"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntityIds([...selectedEntityIds, en.id]);
                            } else {
                              setSelectedEntityIds(selectedEntityIds.filter((id) => id !== en.id));
                            }
                          }}
                        />
                        <span>
                          {en.entityCode} - {en.companyName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Section: Departments */}
          {availableDepartments.length > 0 && (
            <>
              <hr className="border-border" />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                  Assign Departments
                </h3>
                <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-xl border border-border">
                  {availableDepartments.map((dp) => {
                    const isChecked = selectedDepartmentIds.includes(dp.id);
                    return (
                      <label
                        key={dp.id}
                        className="flex items-center gap-2 bg-background hover:bg-muted/50 px-3 py-2 rounded-lg border border-border cursor-pointer transition-colors text-xs font-semibold text-foreground animate-none"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-input text-primary focus:ring-1 focus:ring-primary w-4 h-4 cursor-pointer"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDepartmentIds([...selectedDepartmentIds, dp.id]);
                            } else {
                              setSelectedDepartmentIds(selectedDepartmentIds.filter((id) => id !== dp.id));
                            }
                          }}
                        />
                        <span>
                          {dp.deptCode} - {dp.deptName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Section: User-Level Permissions */}
          {availablePermissions.length > 0 && (
            <>
              <hr className="border-border" />
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                    User-Level Permissions
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      className="bg-background border border-border text-foreground text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-[220px]"
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded px-3 py-2 transition-colors font-semibold whitespace-nowrap cursor-pointer"
                      onClick={() => {
                        const availableIds = availablePermissions.map((p) => p.id);
                        if (selectedPermissions.length === availableIds.length) {
                          setSelectedPermissions([]);
                        } else {
                          setSelectedPermissions(availableIds);
                        }
                      }}
                    >
                      {selectedPermissions.length > 0 && selectedPermissions.length === availablePermissions.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border border-border rounded-xl max-h-[400px] overflow-y-auto space-y-4">
                  {(() => {
                    let filteredPerms = availablePermissions;
                    if (permissionSearch.trim()) {
                      const query = permissionSearch.toLowerCase();
                      filteredPerms = filteredPerms.filter(
                        (p) =>
                          (p.action && p.action.toLowerCase().includes(query)) ||
                          (p.permissionKey && p.permissionKey.toLowerCase().includes(query)) ||
                          (p.description && p.description.toLowerCase().includes(query)) ||
                          (p.module && p.module.toLowerCase().includes(query))
                      );
                    }

                    if (filteredPerms.length === 0) {
                      return (
                        <div className="text-center py-6 text-muted-foreground text-xs">
                          No permissions found matching search criteria.
                        </div>
                      );
                    }

                    const grouped = filteredPerms.reduce<Record<string, Permission[]>>((acc, perm) => {
                      const mod = perm.module || 'Other';
                      if (!acc[mod]) acc[mod] = [];
                      acc[mod].push(perm);
                      return acc;
                    }, {});

                    return Object.keys(grouped).map((mod) => {
                      const modPermIds = grouped[mod].map((p) => p.id);
                      const allSelected = modPermIds.length > 0 && modPermIds.every((id) => selectedPermissions.includes(id));

                      const toggleSelectAll = () => {
                        if (allSelected) {
                          setSelectedPermissions((prev) => prev.filter((id) => !modPermIds.includes(id)));
                        } else {
                          setSelectedPermissions((prev) => {
                            const newIds = new Set([...prev, ...modPermIds]);
                            return Array.from(newIds);
                          });
                        }
                      };

                      return (
                        <div key={mod} className="bg-background/50 border border-border/60 p-4 rounded-lg space-y-3 shadow-sm">
                          <div className="flex justify-between items-center border-b border-border/40 pb-2">
                            <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                              {mod}
                            </h4>
                            <button
                              type="button"
                              className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                              onClick={toggleSelectAll}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {grouped[mod].map((perm) => {
                              const isChecked = selectedPermissions.includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-start gap-2 bg-background hover:bg-muted/40 p-2.5 rounded-md border border-border cursor-pointer transition-colors text-xs ${!perm.active ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  title={`${perm.action}: ${perm.description}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="rounded border-input text-primary focus:ring-1 focus:ring-primary w-4 h-4 mt-0.5 cursor-pointer"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (perm.active) {
                                        if (selectedPermissions.includes(perm.id)) {
                                          setSelectedPermissions(selectedPermissions.filter((id) => id !== perm.id));
                                        } else {
                                          setSelectedPermissions([...selectedPermissions, perm.id]);
                                        }
                                      }
                                    }}
                                    disabled={!perm.active}
                                  />
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="font-semibold text-foreground truncate block">
                                      {perm.action || perm.permissionKey}
                                    </span>
                                    {perm.description && (
                                      <span className="text-[10px] text-muted-foreground block truncate">
                                        {perm.description}
                                      </span>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </EntityFormPage>
    </div>
  );
}
