// src/modules/leads/services/leadsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const leadsApi = createApi({
  reducerPath: 'leadsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_LAP_API_BASE || import.meta.env.VITE_API_BASE || '/api'}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const tenantCode = localStorage.getItem('tenantCode');
      if (tenantCode) {
        headers.set('X-Tenant', tenantCode);
      }
      return headers;
    },
  }),
  tagTypes: ['Leads', 'FollowUps'],
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: () => 'leads/',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Leads', id })), 'Leads'] : ['Leads'],
    }),
    getLeadSchema: builder.query({
      query: () => 'modules/leads/form-schema',
    }),
    createLead: builder.mutation({
      query: (payload) => ({
        url: 'leads/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `leads/${id}/`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Leads', id }],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({ url: `leads/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Leads'],
    }),
    // Follow-ups endpoints
    getFollowUps: builder.query({
      query: () => 'leads/followups/',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'FollowUps', id })), 'FollowUps'] : ['FollowUps'],
    }),
    updateFollowUp: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `leads/followups/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'FollowUps', id }],
    }),
    // Schema CRUD endpoints
    createLeadFormSchema: builder.mutation({
      query: (payload) => ({
        url: 'modules/leads/form-schema',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLeadFormSchema: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `modules/leads/form-schema/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Leads'],
    }),
    deleteLeadFormSchema: builder.mutation({
      query: (id) => ({
        url: `modules/leads/form-schema/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leads'],
    }),
    getLeadFormSchemaVersions: builder.query({
      query: () => 'modules/leads/form-schema/versions',
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadSchemaQuery,
  useGetFollowUpsQuery,
  useUpdateFollowUpMutation,
} = leadsApi;
