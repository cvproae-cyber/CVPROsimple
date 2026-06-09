import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '../components/ui';
import { Code2, Globe2, Tag, AlertCircle, RefreshCw } from 'lucide-react';
import { Template } from '../types';
import { fetchTemplates } from '../services/api';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load templates. Check n8n connectivity.');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

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
        <h2 className="text-xl font-semibold">Unable to load templates</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={loadTemplates} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
          <p className="text-muted-foreground">Manage WhatsApp/Instagram templates.</p>
        </div>
        <Button onClick={loadTemplates} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          No templates found. Add some in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map(t => (
            <Card key={t.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-mono text-primary flex items-center gap-2">
                  <Code2 className="h-4 w-4" /> {t.name}
                </CardTitle>
                <CardDescription className="flex gap-2 mt-1">
                  <Badge variant="outline"><Globe2 className="h-3 w-3 mr-1" /> {t.language}</Badge>
                  <Badge variant="secondary"><Tag className="h-3 w-3 mr-1" /> {t.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm bg-sidebar/50 p-3 rounded-md whitespace-pre-wrap font-mono" dir={t.language === "ar" ? "rtl" : "ltr"}>
                  {t.content.split(/(\{\{[^}]+\}\})/).map((part, i) =>
                    part.startsWith("{{") && part.endsWith("}}") ? (
                      <span key={i} className="text-secondary font-bold bg-secondary/10 px-1 rounded">{part}</span>
                    ) : part
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};