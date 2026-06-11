// src/modules/leads/hooks/useLeads.js
export const useLeads = () => {
  // Mock data since backend connection is removed
  const mockLeads = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Qualified', priority: 'High', company: 'Acme Corp' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'New', priority: 'Medium', company: 'Globex' },
  ];
  return { data: mockLeads, isError: false, isLoading: false };
};

