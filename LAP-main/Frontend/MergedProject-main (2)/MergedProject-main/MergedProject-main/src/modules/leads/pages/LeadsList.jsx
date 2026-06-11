// src/modules/leads/pages/LeadsList.jsx
import React from 'react';
import { useLeads } from '@/modules/leads/hooks/useLeads';
import LeadTable from '@/modules/leads/components/LeadTable';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { UserPlus, Loader2, Users, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { leadsApi } from '@/modules/leads/services/leadsApi';
import { useDispatch } from 'react-redux';

export default function LeadsList() {
  const { data: leads = [], isLoading, isError } = useLeads();
  const dispatch = useDispatch();

  const handleRefresh = () => {
    dispatch(leadsApi.util.invalidateTags(['Leads']));
  };

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  const highPriorityLeads = leads.filter(l => l.priority === 'High').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Pipeline"
        description="Monitor, manage, and convert incoming leads through your marketing funnel."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/leads/create">
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-all">
                <UserPlus className="h-4 w-4" />
                Create Lead
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6 relative overflow-hidden border bg-card hover:shadow-md transition-all group">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{isLoading ? '...' : totalLeads}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden border bg-card hover:shadow-md transition-all group">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 transition-all group-hover:scale-110">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Qualified Leads</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{isLoading ? '...' : qualifiedLeads}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden border bg-card hover:shadow-md transition-all group">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 transition-all group-hover:scale-110">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Priority</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{isLoading ? '...' : highPriorityLeads}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Section */}
      <Card className="border bg-card shadow-sm overflow-hidden rounded-xl">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Lead Records</h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {leads.length} total
          </span>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading leads data...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-muted-foreground border-t border-dashed">
            <p className="font-semibold text-destructive">Failed to fetch leads records.</p>
            <p className="text-xs mt-1">Please ensure the backend server is running.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
              Retry Connection
            </Button>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground border-t">
            <Users className="mx-auto h-12 w-12 opacity-25 mb-4" />
            <p className="font-semibold">No Leads Found</p>
            <p className="text-xs mt-1">Get started by creating your first lead in the system.</p>
            <Link to="/leads/create">
              <Button size="sm" className="mt-4 gap-2">
                <UserPlus className="h-4 w-4" />
                Add First Lead
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <LeadTable leads={leads} />
          </div>
        )}
      </Card>
    </div>
  );
}
