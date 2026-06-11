import rolesApi from './rolesApi';

export interface OfficeLocation {
  id?: string | null;
  name: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  configured?: boolean;
}

export interface AttendanceRecord {
  id?: string | null;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: string;
  hours_worked: number;
  ot_hours: number;
  work_mode: 'office' | 'work_from_home';
  is_wfh: boolean;
  checkin_distance_m?: number | null;
  checkout_distance_m?: number | null;
  checkin_latitude?: number | null;
  checkin_longitude?: number | null;
  checkout_latitude?: number | null;
  checkout_longitude?: number | null;
  holiday_name?: string | null;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
}

export interface RegularizationRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  requested_check_in?: string | null;
  requested_check_out?: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  manager_note?: string;
  created_at: string;
}

export const attendanceService = {
  getOfficeLocation: () => rolesApi.get<OfficeLocation>('/attendance/office-location/'),
  setOfficeLocation: (data: OfficeLocation) => rolesApi.post<OfficeLocation>('/attendance/office-location/', data),
  checkIn: (is_wfh = false, latitude: number | null = null, longitude: number | null = null) =>
    rolesApi.post<{ record: AttendanceRecord }>('/attendance/checkin/', { is_wfh, latitude, longitude }),
  checkOut: (latitude: number | null = null, longitude: number | null = null) =>
    rolesApi.post<AttendanceRecord>('/attendance/checkout/', { latitude, longitude }),
  getToday: () => rolesApi.get<{
    record: AttendanceRecord | null;
    status: string;
    holiday?: Holiday | null;
    is_wfh: boolean;
    work_mode: string;
    check_in?: string | null;
    check_out?: string | null;
    hours_worked?: number;
    ot_hours?: number;
  }>('/attendance/today/'),
  getMyAttendance: (month: number, year: number) =>
    rolesApi.get<unknown>('/attendance/my/', { params: { month, year } }),
  getAllAttendance: (month: number, year: number, employeeId?: string) =>
    rolesApi.get<AttendanceRecord[]>('/attendance/all/', { params: { month, year, employee: employeeId } }),
  applyRegularization: (data: { date: string; requested_check_in?: string; requested_check_out?: string; reason: string }) =>
    rolesApi.post<RegularizationRequest>('/attendance/regularize/', data),
  getMyRegularizations: () => rolesApi.get<RegularizationRequest[]>('/attendance/regularize/my/'),
  getAllRegularizations: (status?: string) =>
    rolesApi.get<RegularizationRequest[]>('/attendance/regularize/all/', { params: { status } }),
  actionRegularization: (id: string, action: 'approve' | 'reject', note: string) =>
    rolesApi.post<RegularizationRequest>(`/attendance/regularize/${id}/action/`, { action, note }),
  getHolidays: () => rolesApi.get<Holiday[]>('/attendance/holidays/'),
  createHoliday: (data: Omit<Holiday, 'id'>) => rolesApi.post<Holiday>('/attendance/holidays/', data),
  updateHoliday: (id: string, data: Partial<Holiday>) => rolesApi.put<Holiday>(`/attendance/holidays/${id}/`, data),
  deleteHoliday: (id: string) => rolesApi.delete(`/attendance/holidays/${id}/`),
};
