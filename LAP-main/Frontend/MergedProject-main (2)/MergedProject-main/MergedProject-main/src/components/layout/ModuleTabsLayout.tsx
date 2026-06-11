import React from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TabItem {
  label: string;
  path: string;
}

const TABS: Record<string, TabItem[]> = {
  'access-control': [
    { label: 'Users Directory', path: '/users' },
    { label: 'Roles List', path: '/roles' },
    { label: 'Role Mapping', path: '/roles/mapping' },
    { label: 'Role Hierarchy', path: '/role-hierarchy' },
    { label: 'Permissions Registry', path: '/permissions' },
  ],
  'settings': [
    { label: 'Settings Home', path: '/settings' },
    { label: 'Company Profile', path: '/settings/company' },
    { label: 'Billing & Plans', path: '/settings/billing' },
    { label: 'Business Entities', path: '/settings/entities' },
    { label: 'Departments', path: '/settings/departments' },
    { label: 'ID Formats', path: '/settings/id-generation' },
    { label: 'Doc Templates', path: '/settings/templates' },
    { label: 'Certificates List', path: '/settings/certificates' },
    { label: 'Onboarding Rules', path: '/settings/onboarding-rules' },
    { label: 'Custom Fields', path: '/settings/dynamic-role-fields' },
    { label: 'System Settings', path: '/settings/system' },
  ],
  'hrms': [
    { label: 'Attendance', path: '/attendance' },
    { label: 'Leave', path: '/leave' },
    { label: 'Payroll', path: '/payroll' },
    { label: 'Branches', path: '/hrms/branches' },
    { label: 'Attendance Shifts', path: '/hrms/shifts' },
  ],
  'crm': [
    { label: 'Leads Directory', path: '/leads' },
    { label: 'Pipeline', path: '/leads/pipeline' },
    { label: 'Followups', path: '/leads/followups' },
    { label: 'Lead Stages', path: '/crm/stages' },
  ],
  'vendor': [
    { label: 'Vendor Dashboard', path: '/vendor/analytics' },
    { label: 'Vendor Directory', path: '/vendor/vendors' },
    { label: 'Vendor Assets', path: '/vendor/assets' },
    { label: 'Requirements', path: '/vendor/requirements' },
    { label: 'Contracts', path: '/vendor/contracts' },
    { label: 'Invoices', path: '/vendor/invoices' },
    { label: 'Performance', path: '/vendor/performance' },
    { label: 'Risk & Compliance', path: '/vendor/risk-compliance' },
  ],
};

function ModuleTabsHeader({ moduleName }: { moduleName: string }) {
  const items = TABS[moduleName];
  const location = useLocation();

  if (!items) return null;

  return (
    <div className="flex gap-1 border-b border-border pb-px mb-6 overflow-x-auto custom-scrollbar whitespace-nowrap">
      {items.map((item) => {
        let isActive = location.pathname === item.path;
        if (!isActive) {
          const hasSiblingTabMatch = items.some(sibling =>
            sibling.path !== item.path &&
            sibling.path !== '/' &&
            (location.pathname === sibling.path || location.pathname.startsWith(sibling.path + '/'))
          );
          if (!hasSiblingTabMatch) {
            isActive = (item.path !== '/' && location.pathname.startsWith(item.path + '/')) ||
              (item.path === '/users' && location.pathname.startsWith('/users/'));
          }
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/leads' || item.path === '/users' || item.path === '/settings' || item.path === '/leave'}
            className={({ isActive: navActive }) => cn(
              "px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-150 cursor-pointer",
              (isActive || navActive)
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
}

export function AccessControlLayout() {
  return (
    <div className="space-y-6">
      <ModuleTabsHeader moduleName="access-control" />
      <Outlet />
    </div>
  );
}

export function SettingsLayout() {
  return (
    <div className="space-y-6">
      <ModuleTabsHeader moduleName="settings" />
      <Outlet />
    </div>
  );
}

export function HrmsLayout() {
  return (
    <div className="space-y-6">
      <ModuleTabsHeader moduleName="hrms" />
      <Outlet />
    </div>
  );
}

export function CrmLayout() {
  return (
    <div className="space-y-6">
      <ModuleTabsHeader moduleName="crm" />
      <Outlet />
    </div>
  );
}

export function VendorLayout() {
  return (
    <div className="space-y-6">
      <ModuleTabsHeader moduleName="vendor" />
      <Outlet />
    </div>
  );
}
