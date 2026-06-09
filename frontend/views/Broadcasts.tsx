import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, Input, Textarea, Select } from '../components/ui';
import { Plus, Megaphone } from 'lucide-react';
import { Broadcast } from '../types';
import { fetchBroadcasts, triggerN8nWorkflow } from '../services/api';
import { MOCK_BROADCASTS } from '../constants';

export const Broadcasts: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "whatsapp", message: "" });
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchBroadcasts();
      setBroadcasts(data.length > 0 ? data : MOCK_BROADCASTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load broadcasts. Using mock data.");
      setBroadcasts(MOCK_BROADCASTS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.message) {
      alert("Please fill in name and message");
      return;
    }
    
    setIsSending(true);
    setErrorMsg(null);
    try {
      // Get the n8n URL from environment (same as in api.ts)
      const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://n8n-1046523361460.me-west1.run.app';
      const webhookUrl = `${N8N_URL}/webhook/api/broadcasts`;
      
      const result = await triggerN8nWorkflow(webhookUrl, {
        name: form.name,
        channel: form.channel,
        message: form.message
      });
      
      console.log("Broadcast created:", result);
      alert(`Broadcast "${form.name}" created successfully!`);
      setOpen(false);
      setForm({ name: "", channel: "whatsapp", message: "" });
      loadBroadcasts(); // refresh list
    } catch (error: any) {
      console.error("Failed to create broadcast:", error);
      setErrorMsg(error.message || "Failed to create broadcast. Check n8n webhook.");
      alert("Failed to create broadcast. See console for details.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Broadcasts</h1>
          <p className="text-muted-foreground">Mass messaging campaigns.</p>
          {errorMsg && <p className="text-sm text-destructive mt-1">{errorMsg}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadBroadcasts}>Refresh</Button>
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Broadcast</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Sent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">1,700</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivery Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">94%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Open Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">68%</div></CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading broadcasts...</TableCell>
              </TableRow>
            ) : broadcasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No broadcasts found.</TableCell>
              </TableRow>
            ) : (
              broadcasts.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="capitalize">{b.channel}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === "completed" ? "default" : "secondary"}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{b.sentCount}</TableCell>
                  <TableCell>{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Create Broadcast</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <Input 
              placeholder="Campaign name" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
            <Select 
              value={form.channel} 
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="all">All Channels</option>
            </Select>
            <Textarea 
              placeholder="Message content" 
              rows={4} 
              value={form.message} 
              onChange={(e) => setForm({ ...form, message: e.target.value })} 
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isSending}>
            {isSending ? 'Creating...' : 'Create Broadcast'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};