import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Select } from '../components/ui';
import { Search, UserPlus } from 'lucide-react';
import { Customer } from '../types';
import { fetchCustomers } from '../services/api';
import { MOCK_CUSTOMERS } from '../constants';

export const Contacts: React.FC = () => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data.length > 0 ? data : MOCK_CUSTOMERS);
    } catch (err) {
      console.error(err);
      setCustomers(MOCK_CUSTOMERS);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = customers.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage leads and track conversions.</p>
        </div>
        <button 
          onClick={loadCustomers}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            className="pl-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-[180px]">
          <option value="all">All Stages</option>
          <option value="new">New Lead</option>
          <option value="qualified">Qualified</option>
          <option value="analysis_done">CV Analyzed</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading contacts...</TableCell>
              </TableRow>
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts found.</TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <div>{c.fullName}</div>
                    <div className="text-xs text-muted-foreground">{c.phone}</div>
                  </TableCell>
                  <TableCell className="capitalize">{c.channel}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{c.stage.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.intentScore > 70 ? "default" : "secondary"}>{c.intentScore}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">{c.language}</Badge>
                  </TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
