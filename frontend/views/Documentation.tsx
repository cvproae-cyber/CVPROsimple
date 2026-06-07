import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { BookOpen, Database, Code } from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prd' | 'sql'>('prd');
  const [prdContent, setPrdContent] = useState<string>('Loading...');
  const [sqlContent, setSqlContent] = useState<string>('Loading...');

  useEffect(() => {
    // Fetching the markdown and sql files we created in the docs folder
    fetch('./docs/MASTER_ARCHITECTURE.md')
      .then(res => res.text())
      .then(text => setPrdContent(text))
      .catch(() => setPrdContent('Failed to load PRD.'));

    fetch('./docs/DATABASE_SCHEMA.sql')
      .then(res => res.text())
      .then(text => setSqlContent(text))
      .catch(() => setSqlContent('Failed to load SQL Schema.'));
  }, []);

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Architecture & Documentation</h1>
        <p className="text-muted-foreground">Complete PRD, Competitor Analysis, and Database Schema.</p>
      </div>

      <div className="flex gap-4 border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab('prd')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-md font-medium transition-colors ${activeTab === 'prd' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <BookOpen className="w-4 h-4" /> Master PRD
        </button>
        <button 
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-md font-medium transition-colors ${activeTab === 'sql' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Database className="w-4 h-4" /> Database Schema
        </button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {activeTab === 'prd' ? (
            <div className="prose prose-invert max-w-none">
              <pre className="bg-transparent text-foreground font-sans whitespace-pre-wrap">
                {prdContent}
              </pre>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-4 right-4 flex items-center gap-2 text-muted-foreground">
                <Code className="w-4 h-4" />
                <span className="text-xs font-mono">PostgreSQL</span>
              </div>
              <pre className="bg-sidebar p-6 rounded-lg overflow-x-auto text-sm font-mono text-blue-300">
                {sqlContent}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
