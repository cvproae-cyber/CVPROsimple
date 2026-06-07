import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '../components/ui';
import { Cpu, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';

export const AIStatus: React.FC = () => {
  const keys = [
    { index: 0, isActive: true, requestCount: 112, errorCount: 0, lastUsed: new Date().toISOString() },
    { index: 1, isActive: true, requestCount: 98, errorCount: 2, lastUsed: new Date().toISOString() },
    { index: 2, isActive: false, requestCount: 1500, errorCount: 12, lastUsed: new Date(Date.now() - 86400000).toISOString() },
  ];

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
              <h3 className="text-3xl font-bold">1,284</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-secondary/10 rounded-full"><KeyRound className="h-8 w-8 text-secondary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Keys</p>
              <h3 className="text-3xl font-bold">2 / 3</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-sidebar rounded-full border border-border"><AlertTriangle className="h-8 w-8 text-amber-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Error Rate (24h)</p>
              <h3 className="text-3xl font-bold">1.2%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Gemini API Key Rotation Pool</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keys.map((key) => (
            <Card key={key.index} className={`relative overflow-hidden ${key.isActive ? "ring-2 ring-primary" : ""}`}>
              {key.isActive && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg">ACTIVE</div>}
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" /> Key #{key.index + 1}</CardTitle>
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
