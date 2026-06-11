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
      { id: 'access-control', label: 'Access Control', path: '/users', icon: Shield, permissions: ['USER_VIEW', 'ROLE_VIEW'] },
      { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, permissions: ['ROLE_VIEW'] },
      { id: 'hrms', label: 'HRMS', path: '/attendance', icon: Clock, module: 'hrms' },
      { id: 'crm', label: 'CRM', path: '/leads', icon: Users, module: 'crm' },
      { id: 'tasks', label: 'Tasks', path: '/tasks', icon: CheckSquare, badge: 8 },
      { id: 'tickets', label: 'Support Tickets', path: '/tickets', icon: Headphones, badge: 4 },
      { id: 'affiliate', label: 'Affiliate', path: '/affiliate', icon: Share2, module: 'crm' },
      { id: 'marketing', label: 'Marketing', path: '/marketing', icon: Megaphone, module: 'crm' },
      { id: 'vendor', label: 'Vendor Management', path: '/vendor/analytics', icon: Store, module: 'VENDOR' },
      { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
      { id: 'self-reports', label: 'Self Reports', path: '/self-reports', icon: BarChart3 },
      { id: 'revenue', label: 'Revenue', path: '/revenue', icon: IndianRupee },
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
