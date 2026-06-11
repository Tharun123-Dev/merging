// src/modules/leads/renderer/DynamicFormRenderer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetLeadSchemaQuery, useCreateLeadMutation } from '@/modules/leads/services/leadsApi';
import UniversalFieldRenderer from '@/modules/leads/renderer/UniversalFieldRenderer';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useToast } from '@/context/ToastContext';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function DynamicFormRenderer() {
  const isSaving = false;
  const { handleSubmit, register, setValue } = useForm();
  const navigate = useNavigate();
  const toast = useToast();

  // Mock schema since backend connection is removed
  const schema = {
    sections: [
      {
        title: "Lead Information",
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true, width: 6 },
          { name: "email", label: "Email Address", type: "email", required: true, width: 6 },
          { name: "company", label: "Company", type: "text", width: 6 },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "New", label: "New" },
              { value: "Qualified", label: "Qualified" },
              { value: "Disqualified", label: "Disqualified" }
            ],
            width: 6
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: [
              { value: "Low", label: "Low" },
              { value: "Medium", label: "Medium" },
              { value: "High", label: "High" }
            ],
            width: 6
          },
        ]
      }
    ]
  };

  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading dynamic form schema...</p>
      </div>
    );
  }

  if (error || !schema || !schema.sections) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-semibold">Failed to load lead schema</p>
        <p className="text-xs mt-1 text-muted-foreground">Please check if the backend server is running.</p>
        <Button variant="outline" className="mt-4 border-destructive/30 hover:bg-destructive/20 text-foreground" onClick={() => navigate('/leads')}>
          Go Back
        </Button>
      </div>
    );
  }

  const onSubmit = async (values) => {
    toast.success('Success!', 'Lead has been created successfully (Mock Mode).');
    navigate('/leads');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/leads')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      <div className="space-y-6">
        {schema.sections.map((section, idx) => (
          <div key={idx} className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-3 mb-6">{section.title}</h3>
            <div className="grid gap-6 grid-cols-12">
              {section.fields.map((field) => (
                <UniversalFieldRenderer
                  key={field.name}
                  field={field}
                  register={register}
                  setValue={setValue}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/leads')}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="min-w-[100px]">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Create Lead'
          )}
        </Button>
      </div>
    </form>
  );
}
