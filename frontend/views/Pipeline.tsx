import React, { useState, useEffect } from 'react';
import { Badge, Button } from '../components/ui';
import { Customer } from '../types';
import { fetchCustomers, updateCustomerStage } from '../services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'فشل تحميل العملاء. تأكد من اتصال n8n.');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  const moveCustomer = async (id: string, newStage: string) => {
    // Optimistic update
    const previousCustomers = [...customers];
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, lead_stage: newStage as any } : c));
    setUpdatingId(id);
    try {
      await updateCustomerStage(id, newStage);
    } catch (err) {
      console.error(err);
      // Rollback on failure
      setCustomers(previousCustomers);
      alert('فشل تحديث المرحلة. حاول مرة أخرى.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex-1 flex flex-col items-center justify-center gap-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">تعذر تحميل مسار المبيعات</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={loadCustomers} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 overflow-auto flex flex-col h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مسار المبيعات</h1>
          <p className="text-muted-foreground">إدارة وتتبع العملاء حسب المرحلة</p>
        </div>
        <Button onClick={loadCustomers} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> تحديث
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {stages.map(stage => (
          <div key={stage.id} className="flex flex-col w-80 shrink-0">
            <div className={`px-4 py-2 rounded-t-lg border-t border-x font-semibold text-sm ${stage.color}`}>
              {stage.name} <span className="ml-2 text-xs">({customers.filter(c => c.lead_stage === stage.id).length})</span>
            </div>
            <div className="flex-1 bg-card border-x border-b rounded-b-lg p-3 space-y-3 overflow-y-auto min-h-[400px]">
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
                    onChange={(e) => moveCustomer(c.id, e.target.value)}
                    disabled={updatingId === c.id}
                  >
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    <option value="lost">خسارة</option>
                  </select>
                  {updatingId === c.id && (
                    <div className="text-xs text-muted-foreground mt-2 text-center">جاري التحديث...</div>
                  )}
                </div>
              ))}
              {customers.filter(c => c.lead_stage === stage.id).length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-4 border-2 border-dashed rounded-lg">لا يوجد عملاء</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};