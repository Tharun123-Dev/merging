// src/modules/leads/renderer/UniversalFieldRenderer.jsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FIELD_COMPONENTS = {
  text: ({ field, register }) => (
    <div className="space-y-2 col-span-12 md:col-span-6">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.name}
        {...register(field.name, { required: field.required })}
        placeholder={field.placeholder}
        className="w-full"
      />
    </div>
  ),
  email: ({ field, register }) => (
    <div className="space-y-2 col-span-12 md:col-span-6">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.name}
        type="email"
        {...register(field.name, { required: field.required })}
        placeholder={field.placeholder}
        className="w-full"
      />
    </div>
  ),
  phone: ({ field, register }) => (
    <div className="space-y-2 col-span-12 md:col-span-6">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.name}
        type="tel"
        {...register(field.name, { required: field.required })}
        placeholder={field.placeholder}
        className="w-full"
      />
    </div>
  ),
  number: ({ field, register }) => (
    <div className="space-y-2 col-span-12 md:col-span-6">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.name}
        type="number"
        {...register(field.name, { required: field.required })}
        placeholder={field.placeholder}
        className="w-full"
      />
    </div>
  ),
  textarea: ({ field, register }) => (
    <div className="space-y-2 col-span-12">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <textarea
        id={field.name}
        {...register(field.name, { required: field.required })}
        placeholder={field.placeholder}
        rows={4}
        className="flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
  select: ({ field, register }) => (
    <div className="space-y-2 col-span-12 md:col-span-6">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <select
        id={field.name}
        {...register(field.name, { required: field.required })}
        defaultValue=""
        className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>Select {field.label.toLowerCase()}...</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  checkbox: ({ field, register }) => (
    <div className="flex items-center space-x-2 col-span-12 py-2">
      <input
        id={field.name}
        type="checkbox"
        {...register(field.name)}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-card"
      />
      <Label htmlFor={field.name} className="text-sm font-medium select-none cursor-pointer">
        {field.label}
      </Label>
    </div>
  ),
  date: ({ field, register }) => (
    <div className="space-y-2 col-span-12 md:col-span-6">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.name}
        type="date"
        {...register(field.name, { required: field.required })}
        className="w-full cursor-pointer"
      />
    </div>
  ),
};

export default function UniversalFieldRenderer({ field, register }) {
  const Renderer = FIELD_COMPONENTS[field.type];
  if (!Renderer) return null;
  return <Renderer field={field} register={register} />;
}
