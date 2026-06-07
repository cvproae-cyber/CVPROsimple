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

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBroadcasts();
      setBroadcasts(data.length > 0 ? data : MOCK_BROADCASTS);
    } catch (err) {
      console.error(err);
      setBroadcasts(MOCK_BROADCASTS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.message) return;
    
    setIsSending(true);
    try {
      // In a real app, you would save the broadcast to Supabase first,
      // then trigger n8n to actually send the messages.
      // For this demo, we'll just simulate triggering the n8n webhook.
      
      // Example of triggering n8n:
      // await triggerN8nWorkflow('https://your-n8n-url.com/webhook/broadcast', form);
      
      alert("Broadcast triggered successfully via n8n (Mock)");
      setOpen(false);
      setForm({ name: "", channel: "whatsapp", message: "" });
      loadBroadcasts();
    } catch (error) {
      console.error("Failed to trigger broadcast:", error);
      alert("Failed to trigger broadcast.");
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
            <Input placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="both">Both</option>
            </Select>
            <Textarea placeholder="Message content" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isSending}>
            {isSending ? 'Sending...' : 'Create'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
