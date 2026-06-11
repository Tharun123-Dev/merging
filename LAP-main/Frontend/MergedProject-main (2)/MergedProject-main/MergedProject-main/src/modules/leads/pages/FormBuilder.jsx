import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';
import Canvas from '@/modules/leads/components/FormBuilder/Canvas';
import FieldEditorDialog from '@/modules/leads/components/FormBuilder/FieldEditorDialog';
import LivePreview from '@/modules/leads/components/FormBuilder/LivePreview';
import { useCreateLeadFormSchemaMutation } from '@/modules/leads/services/leadsApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/context/ToastContext';

export default function FormBuilderPage() {
  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [createSchema, { isLoading }] = useCreateLeadFormSchemaMutation();
  const toast = useToast();

  const addField = () => setEditingField({});
  const editField = (field, index) => setEditingField({ ...field, __index: index });
  const deleteField = index => setFields(prev => prev.filter((_, i) => i !== index));

  const handleSaveField = field => {
    if (field.__index !== undefined) {
      setFields(prev => prev.map((f, i) => (i === field.__index ? field : f)));
    } else {
      setFields(prev => [...prev, field]);
    }
    setEditingField(null);
  };

  const handleReorder = newOrder => setFields(newOrder);

  const handleSaveSchema = async () => {
    const payload = { sections: [{ title: 'Custom Lead Form', fields }] };
    try {
      await createSchema(payload).unwrap();
      toast.success('Success', 'Form schema saved');
    } catch (err) {
      toast.error('Error', 'Failed to save schema');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Lead Form Builder" description="Add, edit, reorder fields to customize the lead creation form." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <Canvas fields={fields} onEdit={editField} onDelete={deleteField} onReorder={handleReorder} />
          <Dialog open={!!editingField} onOpenChange={open => !open && setEditingField(null)}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingField?.__index !== undefined ? 'Edit Field' : 'Add New Field'}</DialogTitle>
              </DialogHeader>
              <FieldEditorDialog field={editingField || {}} onSave={handleSaveField} onCancel={() => setEditingField(null)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={addField} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" /> Add Field
          </Button>
          <Button onClick={handleSaveSchema} disabled={isLoading} className="ml-2">
            {isLoading ? 'Saving…' : 'Save Form Schema'}
          </Button>
        </div>
        <div className="col-span-1 border-t pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-4">
          <LivePreview fields={fields} />
        </div>
      </div>
    </div>
  );
}
