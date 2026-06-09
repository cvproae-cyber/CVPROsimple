import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress, Button } from '../components/ui';
import { Cpu, KeyRound, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { triggerN8nWorkflow } from '../services/api';

// This would need a corresponding webhook in n8n that returns key status.
// For now, we'll try to fetch from a hypothetical endpoint, or show a message.
export const AIStatus: React.FC = () => {
  const [keys, setKeys] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Attempt to fetch real key status from n8n endpoint (if implemented)
      // For demo, we'll simulate a call; if fails, show error.
      // Replace with actual endpoint when available.
      const data = await triggerN8nWorkflow('/api/ai-status', {});
      setKeys(data.keys || []);
    } catch (err: any) {
      console.error(err);
      setError('AI status endpoint not configured. Please set up n8n webhook /api/ai-status');
      setKeys(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !keys) {
    return (
      <div className="p-8 space-y-6 flex-1 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI & Gemini Status</h1>
          <p className="text-muted-foreground">Monitor API key rotation and system health.</p>
        </div>
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-center text-destructive">{error || 'Unable to fetch AI status. Please configure n8n webhook.'}</p>
            <Button onClick={loadStatus} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we have real data, render it (same structure as before)
  const totalRequests = keys.reduce((sum, k) => sum + (k.requestCount || 0), 0);
  const activeKeys = keys.filter(k => k.isActive).length;
  const errorRate = (keys.reduce((sum, k) => sum + (k.errorCount || 0), 0) / totalRequests * 100).toFixed(1);

  return (
    <div className="p-8 space-y-8 flex-1 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI & Gemini Status</h1>
        <p className="text-muted-foreground">Monitor API key rotation and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full"><Cpu className="h-8 w-8 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total API Requests</p>
              <h3 className="text-3xl font-bold">{totalRequests.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-secondary/10 rounded-full"><KeyRound className="h-8 w-8 text-secondary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Keys</p>
              <h3 className="text-3xl font-bold">{activeKeys} / {keys.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-sidebar rounded-full border border-border"><AlertTriangle className="h-8 w-8 text-amber-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Error Rate (24h)</p>
              <h3 className="text-3xl font-bold">{errorRate}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Gemini API Key Rotation Pool</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keys.map((key, idx) => (
            <Card key={idx} className={`relative overflow-hidden ${key.isActive ? "ring-2 ring-primary" : ""}`}>
              {key.isActive && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg">ACTIVE</div>}
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" /> Key #{key.index || idx + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <Badge variant={key.isActive ? "default" : "destructive"}>
                    {key.isActive ? <><CheckCircle className="h-3 w-3 mr-1" /> Operational</> : "Exhausted"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Errors: {key.errorCount}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Usage (RPM)</span>
                    <span>{key.requestCount} / 1500</span>
                  </div>
                  <Progress value={(key.requestCount / 1500) * 100} />
                </div>
                <p className="text-xs text-muted-foreground">Last used: {new Date(key.lastUsed).toLocaleTimeString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};