// src/modules/leads/pages/LeadDetails.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useLead } from '@/modules/leads/hooks/useLead';
import LeadHeader from '@/modules/leads/components/LeadHeader';

export default function LeadDetails() {
  const { id } = useParams();
  const { data: lead, isLoading, isError } = useLead(id);

  if (isLoading) return <p>Loading lead...</p>;
  if (isError) return <p className="text-red-500">Error loading lead.</p>;

  return (
    <div className="p-4">
      <LeadHeader lead={lead} />
      {/* Additional tabs and details can be added here */}
    </div>
  );
}
