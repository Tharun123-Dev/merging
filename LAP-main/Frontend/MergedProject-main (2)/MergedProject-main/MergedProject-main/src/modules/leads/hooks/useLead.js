// src/modules/leads/hooks/useLead.js
export const useLead = (id) => {
  // Mock data since backend connection is removed
  const mockLead = {
    id: id || '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Qualified',
    priority: 'High',
    company: 'Acme Corp',
    phone: '555-0199',
    description: 'This is a mock lead details description.',
    createdAt: new Date().toISOString(),
  };
  return { data: mockLead, isError: false, isLoading: false };
};
