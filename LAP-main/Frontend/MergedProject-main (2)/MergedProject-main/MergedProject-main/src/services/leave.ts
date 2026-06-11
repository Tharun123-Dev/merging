import rolesApi from './rolesApi';

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  days_allowed: number;
  applicable_to: string;
  carry_forward: boolean;
  max_carry_forward: number;
  is_paid: boolean;
  requires_document: boolean;
  min_notice_days: number;
  description?: string;
}

export interface LeaveBalance {
  id?: number;
  leave_type_id: number;
  leave_type_name?: string;
  leave_type_code?: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
  carried_forward?: number;
  carried?: number;
  carry_forward?: boolean;
  base_allocation?: number;
  this_year_remaining?: number;
  cf_remaining?: number;
  is_paid?: boolean;
  max_carry_forward?: number;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  emp_code?: string;
  leave_type: number;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  session: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  days: number;
  applied_at: string;
  approver_name?: string;
  approver_note?: string;
  doc_url?: string;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  description?: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  category: string;
}

export const leaveService = {
  // Leave Types
  getLeaveTypes: () => rolesApi.get<LeaveType[]>('/leave/types/'),
  createLeaveType: (data: Partial<LeaveType>) => rolesApi.post('/leave/types/', data),
  updateLeaveType: (id: number, data: Partial<LeaveType>) => rolesApi.patch(`/leave/types/${id}/`, data),
  deleteLeaveType: (id: number) => rolesApi.delete(`/leave/types/${id}/`),

  // Leave Balances
  getMyBalance: (year: number) => rolesApi.get<LeaveBalance[]>('/leave/balance/', { params: { year } }),

  // Leave Applications
  applyLeave: (data: { leave_type: string; start_date: string; end_date: string; session: string; reason: string; doc_url?: string }) =>
    rolesApi.post('/leave/apply/', data),
  getMyRequests: (status?: string) => rolesApi.get<LeaveRequest[]>('/leave/my/', { params: { status } }),
  cancelLeave: (id: number) => rolesApi.post(`/leave/${id}/cancel/`),

  // Leave Approvals
  getAllRequests: (status?: string, employee?: string) =>
    rolesApi.get<LeaveRequest[]>('/leave/all/', { params: { status, employee } }),
  leaveAction: (id: number, action: 'approve' | 'reject', note: string) =>
    rolesApi.post(`/leave/${id}/action/`, { action, note }),
  getLeavePriorUsage: (id: number) => rolesApi.get(`/leave/${id}/prior-usage/`, { params: { id } }),

  // System Settings
  getSystemSettings: () => rolesApi.get<Record<string, SystemSetting[]>>('/system-settings/'),

  // Holidays
  getHolidays: () => rolesApi.get<Holiday[]>('/attendance/holidays/'),
  createHoliday: (data: { date: string; name: string; description?: string }) =>
    rolesApi.post('/attendance/holidays/', data),
  updateHoliday: (id: number, data: { date: string; name: string; description?: string }) =>
    rolesApi.put(`/attendance/holidays/${id}/`, data),
  deleteHoliday: (id: number) => rolesApi.delete(`/attendance/holidays/${id}/`),
};
