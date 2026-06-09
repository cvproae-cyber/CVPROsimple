import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { BookOpen, Database, Code, AlertCircle, RefreshCw } from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prd' | 'sql'>('prd');
  const [prdContent, setPrdContent] = useState<string>('');
  const [sqlContent, setSqlContent] = useState<string>('');
  const [prdError, setPrdError] = useState(false);
  const [sqlError, setSqlError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      // Try to fetch PRD markdown
      try {
        const res = await fetch('./docs/MASTER_ARCHITECTURE.md');
        if (res.ok) {
          const text = await res.text();
          setPrdContent(text);
        } else {
          setPrdError(true);
          setPrdContent('⚠️ Documentation file not found. Please add `docs/MASTER_ARCHITECTURE.md` to the public folder.');
        }
      } catch {
        setPrdError(true);
        setPrdContent('⚠️ Unable to load documentation. Make sure the file exists in the `docs/` folder.');
      }

      // Try to fetch SQL schema
      try {
        const res = await fetch('./docs/DATABASE_SCHEMA.sql');
        if (res.ok) {
          const text = await res.text();
          setSqlContent(text);
        } else {
          setSqlError(true);
          setSqlContent('-- SQL schema file not found. Please add `docs/DATABASE_SCHEMA.sql`.\n-- Refer to schema.sql in the project root for the complete schema.');
        }
      } catch {
        setSqlError(true);
        setSqlContent('-- Unable to load SQL schema. File not found in public/docs/');
      }
      setIsLoading(false);
    };
    fetchDocs();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (activeTab === 'prd') {
      if (prdError) {
        return (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p>{prdContent}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        );
      }
      return (
        <div className="prose prose-invert max-w-none">
          <pre className="bg-transparent text-foreground font-sans whitespace-pre-wrap">
            {prdContent}
          </pre>
        </div>
      );
    } else {
      return (
        <div className="relative">
          <div className="absolute top-4 right-4 flex items-center gap-2 text-muted-foreground">
            <Code className="w-4 h-4" />
            <span className="text-xs font-mono">PostgreSQL</span>
          </div>
          <pre className="bg-sidebar p-6 rounded-lg overflow-x-auto text-sm font-mono text-blue-300">
            {sqlContent}
          </pre>
          {sqlError && (
            <div className="mt-4 text-center text-amber-500 text-sm">
              ⚠️ Displaying fallback message. To see the actual schema, open `schema.sql` in the project root.
            </div>
          )}
        </div>
      );
    }
  };

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
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};