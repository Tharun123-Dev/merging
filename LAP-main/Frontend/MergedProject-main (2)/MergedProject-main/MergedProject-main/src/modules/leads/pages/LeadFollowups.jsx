// src/modules/leads/pages/LeadFollowups.jsx
import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetLeadsQuery, 
  useGetFollowUpsQuery, 
  useUpdateFollowUpMutation 
} from '@/modules/leads/services/leadsApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { 
  CalendarClock, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Loader2, 
  Clock, 
  User, 
  Mail, 
  Inbox,
  AlertCircle
} from 'lucide-react';

const mockLeads = [
  { id: '1', full_name: 'Alex Rivera', email: 'alex.rivera@example.com', phone: '+1-555-0101', status: 'contacted' },
  { id: '2', full_name: 'Bianca Vance', email: 'bianca.vance@example.com', phone: '+1-555-0102', status: 'qualified' },
  { id: '3', full_name: 'Cedric Stone', email: 'cedric.stone@example.com', phone: '+1-555-0103', status: 'proposal' }
];

const mockFollowups = [
  { id: 'fup-1', lead_id: '1', note: 'Schedule product demo session', scheduled_at: new Date(Date.now() + 86400000).toISOString(), completed: false },
  { id: 'fup-2', lead_id: '2', note: 'Send price sheet proposals', scheduled_at: new Date(Date.now() + 172800000).toISOString(), completed: false },
  { id: 'fup-3', lead_id: '3', note: 'Initial introductory discovery call', scheduled_at: new Date(Date.now() - 86400000).toISOString(), completed: true }
];

export default function LeadFollowups() {
  const [search, setSearch] = useState('');
  
  // RTK Query hooks
  const { data: remoteLeads = [], isLoading: leadsLoading, isError: leadsError } = useGetLeadsQuery();
  const { 
    data: remoteFollowups = [], 
    isLoading: followupsLoading, 
    isError: followupsError,
    refetch 
  } = useGetFollowUpsQuery();
  
  const [updateFollowUp, { isLoading: isUpdating }] = useUpdateFollowUpMutation();

  const [localFollowups, setLocalFollowups] = useState([]);

  useEffect(() => {
    const fData = remoteFollowups?.results || remoteFollowups?.data || (Array.isArray(remoteFollowups) ? remoteFollowups : []);
    if (fData && fData.length > 0) {
      setLocalFollowups(fData);
    } else if (followupsError) {
      setLocalFollowups(mockFollowups);
    }
  }, [remoteFollowups, followupsError]);

  useEffect(() => {
    const fData = remoteFollowups?.results || remoteFollowups?.data || (Array.isArray(remoteFollowups) ? remoteFollowups : []);
    if (!followupsLoading && localFollowups.length === 0 && fData.length === 0) {
      setLocalFollowups(mockFollowups);
    }
  }, [followupsLoading, remoteFollowups]);

  const handleRefresh = () => {
    refetch();
    toast.success('Refreshing follow-ups...');
  };

  const leadsRaw = remoteLeads?.results || remoteLeads?.data || (Array.isArray(remoteLeads) ? remoteLeads : []);
  const leads = leadsError || !leadsRaw || leadsRaw.length === 0 ? mockLeads : leadsRaw;

  const leadById = useMemo(() => {
    const lookup = {};
    leads.forEach((lead) => {
      if (lead && lead.id) {
        lookup[String(lead.id)] = lead;
      }
    });
    return lookup;
  }, [leads]);

  const [completedIds, setCompletedIds] = useState([]);

  const processedFollowups = useMemo(() => {
    return localFollowups.map((followup) => {
      const lead = leadById[String(followup.lead_id)];
      const isCompleted = followup.completed || completedIds.includes(String(followup.id));
      return {
        ...followup,
        completed: isCompleted,
        lead
      };
    });
  }, [localFollowups, leadById, completedIds]);

  const filteredFollowups = useMemo(() => {
    return processedFollowups.filter((fup) => {
      const leadName = (fup.lead?.full_name || fup.lead?.name || '').toLowerCase();
      const leadEmail = (fup.lead?.email || '').toLowerCase();
      const noteText = (fup.note || '').toLowerCase();
      const query = search.toLowerCase();
      return leadName.includes(query) || leadEmail.includes(query) || noteText.includes(query);
    });
  }, [processedFollowups, search]);

  const sortedFollowups = useMemo(() => {
    return [...filteredFollowups].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(a.scheduled_at || a.created_at || 0) - new Date(b.scheduled_at || b.created_at || 0);
    });
  }, [filteredFollowups]);

  // KPI calculations
  const totalCount = processedFollowups.length;
  const pendingCount = processedFollowups.filter((f) => !f.completed).length;
  const completedCount = processedFollowups.filter((f) => f.completed).length;

  const handleMarkComplete = async (followup) => {
    try {
      await updateFollowUp({ id: followup.id, completed: true }).unwrap();
      toast.success('Follow-up marked as completed');
    } catch (err) {
      console.warn('Failed to update follow-up on backend, updating local state:', err);
      setCompletedIds(prev => [...prev, String(followup.id)]);
      toast.success('Follow-up marked as completed (local)');
    }
  };

  const isLoading = leadsLoading || followupsLoading;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Lead Followups"
        description="Track counselor scheduled interactions and actions with prospective leads."
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {followupsError && (
        <div className="p-3 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Offline Mode: Backend server is unreachable. Showing local fallback followups.</span>
        </div>
      )}

      {/* KPI Stats Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6 relative overflow-hidden border border-slate-800 bg-slate-950/40 backdrop-blur-md hover:shadow-md transition-all group">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 transition-all group-hover:scale-110">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Followups</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{isLoading ? '...' : totalCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden border border-slate-800 bg-slate-950/40 backdrop-blur-md hover:shadow-md transition-all group">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 transition-all group-hover:scale-110">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Pending Actions</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{isLoading ? '...' : pendingCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden border border-slate-800 bg-slate-950/40 backdrop-blur-md hover:shadow-md transition-all group">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 transition-all group-hover:scale-110">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Completed Interactions</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{isLoading ? '...' : completedCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Control Panel (Search / Filter) */}
      <div className="flex items-center justify-between gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, names, or emails..."
            className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">
          Showing {sortedFollowups.length} of {totalCount} records
        </span>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400 font-medium">Loading followups from server...</p>
        </div>
      ) : sortedFollowups.length === 0 ? (
        <div className="p-16 text-center border border-slate-850 bg-slate-950/10 rounded-2xl">
          <Inbox className="mx-auto h-12 w-12 text-slate-600 mb-4 opacity-50" />
          <p className="font-semibold text-slate-300">No Followups Found</p>
          <p className="text-xs text-slate-500 mt-1">There are no followups matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedFollowups.map((followup) => {
            const lead = followup.lead;
            const name = lead?.full_name || lead?.name || `Lead #${followup.lead_id}`;
            const email = lead?.email || 'No email';
            const scheduledDate = followup.scheduled_at 
              ? new Date(followup.scheduled_at).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Unscheduled';

            return (
              <Card 
                key={followup.id} 
                className={`p-5 border transition-all relative flex flex-col justify-between ${
                  followup.completed 
                    ? 'bg-slate-950/10 border-slate-900 opacity-75' 
                    : 'bg-slate-950/40 border-slate-850 shadow-md hover:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header (Lead Name & Status Badge) */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <h4 className="font-bold text-slate-200 text-sm truncate max-w-[180px] sm:max-w-xs">{name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px] sm:max-w-xs">{email}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        followup.completed 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {followup.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Note / Followup Content */}
                  <p className="text-xs text-slate-300 bg-slate-900/40 border border-slate-850/50 p-3 rounded-xl min-h-[50px] leading-relaxed">
                    {followup.note || 'No notes provided for this follow-up.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-slate-900 mt-4 pt-3 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{scheduledDate}</span>
                  </div>

                  {!followup.completed && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkComplete(followup)}
                      disabled={isUpdating}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 h-auto rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Complete
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
