import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Select, Button } from '../components/ui';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Customer } from '../types';
import { fetchCustomers } from '../services/api';

export const Contacts: React.FC = () => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Error loading customers:', err);
      setError(err.message || 'فشل تحميل جهات الاتصال. تأكد من اتصال n8n.');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredContacts = customers.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) || c.phone_number.includes(search);
    const matchesStage = stageFilter === 'all' || c.lead_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

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
        <h2 className="text-xl font-semibold">تعذر تحميل جهات الاتصال</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={loadCustomers} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">جهات الاتصال</h1>
          <p className="text-muted-foreground">إدارة العملاء وتتبع التحويلات</p>
        </div>
        <Button onClick={loadCustomers} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> تحديث البيانات
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-[180px]">
          <option value="all">كل المراحل</option>
          <option value="new">عميل جديد</option>
          <option value="qualified">مؤهل</option>
          <option value="analysis_done">تم تحليل السيرة</option>
          <option value="proposal_sent">تم إرسال العرض</option>
          <option value="negotiation">تفاوض</option>
          <option value="won">تم البيع</option>
          <option value="lost">خسارة</option>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>المرحلة</TableHead>
              <TableHead>درجة الاهتمام</TableHead>
              <TableHead>اللغة</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  لا توجد جهات اتصال تطابق المعايير
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <div>{c.full_name}</div>
                    <div className="text-xs text-muted-foreground">{c.phone_number}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{c.lead_stage.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.buying_intent_score > 70 ? "default" : "secondary"}>{c.buying_intent_score}</Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="uppercase">{c.language}</Badge></TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};