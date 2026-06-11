// src/modules/leads/components/LeadTable.jsx
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, User } from 'lucide-react';
import { useDeleteLeadMutation } from '@/modules/leads/services/leadsApi';
import { useToast } from '@/context/ToastContext';

const statusVariants = {
  New: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20',
  Contacted: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20',
  Qualified: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20',
  Lost: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20',
};

const priorityVariants = {
  High: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20',
  Low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20',
};

export default function LeadTable({ leads }) {
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const toast = useToast();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete lead: "${name}"?`)) {
      try {
        await deleteLead(id).unwrap();
        toast.success('Deleted', `Lead "${name}" has been deleted.`);
      } catch (err) {
        toast.error('Error', 'Failed to delete lead.');
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="font-semibold w-[220px]">Lead Name</TableHead>
          <TableHead className="font-semibold w-[180px]">Company</TableHead>
          <TableHead className="font-semibold w-[130px]">Status</TableHead>
          <TableHead className="font-semibold w-[120px]">Priority</TableHead>
          <TableHead className="font-semibold w-[180px]">Assigned To</TableHead>
          <TableHead className="font-semibold w-[150px]">Follow‑up Date</TableHead>
          <TableHead className="font-semibold w-[80px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id} className="group hover:bg-muted/30 transition-colors">
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell className="text-muted-foreground">{lead.company || '—'}</TableCell>
            <TableCell>
              <Badge variant="outline" className={`font-semibold border ${statusVariants[lead.status] || 'bg-secondary text-secondary-foreground'}`}>
                {lead.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={`font-semibold border ${priorityVariants[lead.priority] || 'bg-secondary text-secondary-foreground'}`}>
                {lead.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">{lead.assigned_to?.name || 'Unassigned'}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {lead.followup_date ? new Date(lead.followup_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : '—'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(lead.id, lead.name)}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
