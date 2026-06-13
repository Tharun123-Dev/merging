import {
  LayoutDashboard,
  Users,
  CheckSquare,
  IndianRupee,
  Clock,
  Headphones,
  Share2,
  Megaphone,
  BarChart3,
  Settings,
  Store,
  Shield,
} from 'lucide-react'
import type { NavSection } from '@/types'

export const navigationConfig: NavSection[] = [
  {
    id: 'main',
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { id: 'access-control', label: 'Access Control', path: '/users', icon: Shield, permissions: ['USER_VIEW', 'USER_CREATE', 'USER_UPDATE', 'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_UPDATE'] },
      { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, permissions: ['ROLE_VIEW', 'ROLE_CREATE', 'ROLE_UPDATE', 'SETTINGS_MANAGE_SETTINGS'] },
      { id: 'hrms', label: 'HRMS', path: '/attendance', icon: Clock, module: 'ATTENDANCE,LEAVE,PAYROLL', permissions: ['ATTENDANCE_VIEW_ATTENDANCE', 'LEAVE_VIEW_LEAVE', 'PAYROLL_VIEW_PAYROLL', 'PAYROLL_VIEW_SALARY', 'PAYROLL_VIEW_PAYSLIP'] },
      { id: 'crm', label: 'CRM', path: '/leads', icon: Users, module: 'leads', permissions: ['LEADS_VIEW_LEADS'] },
      { id: 'tasks', label: 'Tasks', path: '/tasks', icon: CheckSquare, module: 'tasks', permissions: ['TASKS_VIEW_TASKS'] },
      { id: 'tickets', label: 'Support Tickets', path: '/tickets', icon: Headphones, module: 'support_tickets', permissions: ['SUPPORT_TICKETS_VIEW_SUPPORT_TICKETS'] },
      { id: 'affiliate', label: 'Affiliate', path: '/affiliate', icon: Share2, module: 'affiliate', permissions: ['AFFILIATE_VIEW_AFFILIATE'] },
      { id: 'marketing', label: 'Marketing', path: '/marketing', icon: Megaphone, module: 'marketing', permissions: ['MARKETING_VIEW', 'MARKETING_ANALYTICS_VIEW'] },
      { id: 'vendor', label: 'Vendor Management', path: '/vendor/analytics', icon: Store, module: 'VENDOR', permissions: ['VENDOR_VIEW', 'VENDOR_MANAGE'] },
      { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3, module: 'reports', permissions: ['REPORTS_VIEW_REPORTS'] },
      { id: 'self-reports', label: 'Self Reports', path: '/self-reports', icon: BarChart3, module: 'reports', permissions: ['REPORTS_SELF_REPORTS'] },
      { id: 'revenue', label: 'Revenue', path: '/revenue', icon: IndianRupee, module: 'revenue', permissions: ['REVENUE_VIEW_REVENUE'] }
    ],
  }
]

export const placeholderRoutes = [
  { path: '/users', title: 'Users', description: 'Manage organization users, roles, and access.' },
  { path: '/leads', title: 'Leads', description: 'Track and convert leads across your pipeline.' },
  { path: '/followups', title: 'Followups', description: 'Schedule and monitor customer follow-ups.' },
  { path: '/tasks', title: 'Tasks', description: 'Assign and track team tasks and workflows.' },
  { path: '/revenue', title: 'Revenue', description: 'Monitor revenue streams and forecasts.' },
]

export { quickActionDefinitions as quickActions } from '@/config/quick-actions'
