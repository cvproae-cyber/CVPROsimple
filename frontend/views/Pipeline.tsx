import React, { useState, useEffect } from 'react';
import { Badge } from '../components/ui';
import { Customer } from '../types';
import { fetchCustomers, updateCustomerStage } from '../services/api';
import { MOCK_CUSTOMERS } from '../constants';

const stages = [
  { id: 'new', name: 'عميل جديد', color: 'bg-slate-700' },
  { id: 'qualified', name: 'مؤهل', color: 'bg-blue-900/50' },
  { id: 'analysis_done', name: 'تم تحليل السيرة', color: 'bg-indigo-900/50' },
  { id: 'proposal_sent', name: 'تم إرسال العرض', color: 'bg-amber-900/50' },
  { id: 'negotiation', name: 'تفاوض', color: 'bg-orange-900/50' },
  { id: 'won', name: 'تم البيع', color: 'bg-emerald-900/50' },
];

export const Pipeline: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data.length ? data : MOCK_CUSTOMERS);
      setError(null);
    } catch (err) {
      console.error(err);
      setCustomers(MOCK_CUSTOMERS);
      setError('فشل الاتصال بقاعدة البيانات - استخدام بيانات تجريبية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  const moveCustomer = async (id: string, newStage: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, lead_stage: newStage } : c));
    try {
      await updateCustomerStage(id, newStage);
    } catch (err) {
      loadCustomers();
      alert('فشل تحديث المرحلة');
    }
  };

  return (
    <div className="p-8 flex-1 overflow-auto flex flex-col h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مسار المبيعات</h1>
          <p className="text-muted-foreground">إدارة وتتبع العملاء حسب المرحلة</p>
          {error && <p className="text-amber-500 text-sm mt-2">{error}</p>}
        </div>
        <button onClick={loadCustomers} className="px-4 py-2 bg-secondary rounded-md text-sm">تحديث</button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {stages.map(stage => (
            <div key={stage.id} className="flex flex-col w-80 shrink-0">
              <div className={`px-4 py-2 rounded-t-lg border-t border-x font-semibold text-sm ${stage.color}`}>
                {stage.name} <span className="ml-2 text-xs">({customers.filter(c => c.lead_stage === stage.id).length})</span>
              </div>
              <div className="flex-1 bg-card border-x border-b rounded-b-lg p-3 space-y-3 overflow-y-auto">
                {customers.filter(c => c.lead_stage === stage.id).map(c => (
                  <div key={c.id} className="bg-background p-4 rounded-lg border">
                    <div className="font-medium text-sm mb-1">{c.full_name}</div>
                    <div className="text-xs text-muted-foreground mb-3">{c.phone_number}</div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs">درجة الاهتمام</span>
                      <Badge variant={c.buying_intent_score > 80 ? 'default' : 'secondary'}>{c.buying_intent_score}</Badge>
                    </div>
                    <select
                      className="w-full bg-secondary text-xs rounded p-1.5"
                      value={c.lead_stage}
                      onChange={(e) => moveCustomer(c.id, e.target.value)}>
                      {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      <option value="lost">خسارة</option>
                    </select>
                  </div>
                ))}
                {customers.filter(c => c.lead_stage === stage.id).length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4 border-2 border-dashed rounded-lg">لا يوجد عملاء</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};