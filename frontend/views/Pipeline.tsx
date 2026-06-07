import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { Badge } from '../components/ui';
import { fetchCustomers, updateCustomerStage } from '../services/api';
import { MOCK_CUSTOMERS } from '../constants';

const stages = [
  { id: 'new', name: 'New Lead', color: 'bg-slate-700' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-900/50 border-blue-500/50' },
  { id: 'analysis_done', name: 'CV Analyzed', color: 'bg-indigo-900/50 border-indigo-500/50' },
  { id: 'proposal_sent', name: 'Proposal Sent', color: 'bg-amber-900/50 border-amber-500/50' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-900/50 border-orange-500/50' },
  { id: 'won', name: 'Won', color: 'bg-emerald-900/50 border-emerald-500/50' },
];

export const Pipeline: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCustomers();
      // Fallback to mock data if Supabase is not configured or returns empty
      if (data.length === 0) {
        setCustomers(MOCK_CUSTOMERS);
        setError("Using mock data. Connect Supabase to see real leads.");
        setIsConnected(false);
      } else {
        setCustomers(data);
        setError(null);
        setIsConnected(true);
      }
    } catch (err) {
      console.error(err);
      setCustomers(MOCK_CUSTOMERS);
      setError("Failed to connect to database. Using mock data.");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const moveCustomer = async (id: string, newStage: Customer['stage']) => {
    // Optimistic UI update
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
    
    try {
      // Update in Supabase
      await updateCustomerStage(id, newStage);
    } catch (err) {
      // Revert on failure
      loadCustomers();
      alert("Failed to update stage in database.");
    }
  };

  return (
    <div className="p-8 flex-1 overflow-auto flex flex-col h-full">
      <div className="mb-8 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track and manage leads across stages.</p>
          {isConnected && <p className="text-emerald-500 text-sm mt-2">● Connected to Supabase</p>}
          {error && <p className="text-amber-500 text-sm mt-2">{error}</p>}
        </div>
        <button 
          onClick={loadCustomers}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {stages.map(stage => (
            <div key={stage.id} className="flex flex-col w-80 shrink-0">
              <div className={`px-4 py-2 rounded-t-lg border-t border-x font-semibold text-sm ${stage.color}`}>
                {stage.name}
                <span className="ml-2 text-xs opacity-70">
                  ({customers.filter(c => c.stage === stage.id).length})
                </span>
              </div>
              <div className="flex-1 bg-card border-x border-b rounded-b-lg p-3 space-y-3 overflow-y-auto">
                {customers.filter(c => c.stage === stage.id).map(customer => (
                  <div key={customer.id} className="bg-background p-4 rounded-lg border border-border shadow-sm">
                    <div className="font-medium text-sm mb-1">{customer.fullName}</div>
                    <div className="text-xs text-muted-foreground mb-3">{customer.phone}</div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-muted-foreground">Intent Score</span>
                      <Badge variant={customer.intentScore > 80 ? 'default' : 'secondary'} className="text-[10px]">
                        {customer.intentScore}
                      </Badge>
                    </div>

                    <select 
                      className="w-full bg-secondary text-xs rounded p-1.5 border-none outline-none focus:ring-1 focus:ring-primary"
                      value={customer.stage}
                      onChange={(e) => moveCustomer(customer.id, e.target.value as Customer['stage'])}
                    >
                      {stages.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                ))}
                {customers.filter(c => c.stage === stage.id).length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4 border-2 border-dashed border-border rounded-lg">
                    No leads
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
