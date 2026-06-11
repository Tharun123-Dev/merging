// src/modules/leads/pages/LeadCreate.jsx
import React from 'react';
import DynamicFormRenderer from '@/modules/leads/renderer/DynamicFormRenderer';
import { PageHeader } from '@/components/shared/PageHeader';

export default function LeadCreate() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Lead"
        description="Fill out the dynamic form below to register a new lead in your scoping system."
      />
      <div className="max-w-4xl mx-auto">
        <DynamicFormRenderer />
      </div>
    </div>
  );
}
