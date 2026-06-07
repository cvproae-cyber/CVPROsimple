import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Progress } from '../components/ui';
import { Sparkles, FileText, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { analyzeCVText } from '../services/geminiService';
import { CVAnalysisResult } from '../types';

export const CVAnalyzer: React.FC = () => {
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CVAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!cvText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await analyzeCVText(cvText);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze CV. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [cvText]);

  const handleClear = useCallback(() => {
    setCvText('');
    setResult(null);
  }, [cvText]);

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI CV Analyzer</h1>
          <p className="text-muted-foreground">Powered by Gemini 2.5 Flash</p>
        </div>
        
        <Card className="flex-1 flex flex-col min-h-[500px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> 
                Paste CV Content
              </CardTitle>
              {cvText && (
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea 
              placeholder="Paste the raw text of the candidate's CV here..." 
              className="flex-1 resize-none font-mono text-sm bg-background" 
              value={cvText} 
              onChange={(e) => setCvText(e.target.value)} 
            />
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !cvText.trim()} 
              className="w-full h-12 text-base"
            >
              {isAnalyzing ? (
                <><Sparkles className="mr-2 h-5 w-5 animate-pulse" /> Analyzing with Gemini...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Analyze CV</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-[450px] xl:w-[500px] space-y-6">
        {!result && !isAnalyzing && (
          <div className="h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[500px]">
            <Sparkles className="h-12 w-12 mb-4 opacity-20" />
            <p>Paste a CV and click Analyze to see AI-generated insights, scoring, and a personalized sales pitch.</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="h-full border border-border rounded-xl flex flex-col items-center justify-center p-8 text-center min-h-[500px] bg-card">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Extracting entities and evaluating ATS compatibility...</p>
          </div>
        )}

        {result && !isAnalyzing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">ATS Compatibility Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4 mb-2">
                  <div className={`text-6xl font-black ${result.score >= 70 ? 'text-emerald-500' : result.score >= 40 ? 'text-amber-500' : 'text-destructive'}`}>
                    {result.score}
                  </div>
                  <div className="text-muted-foreground mb-2">/ 100</div>
                </div>
                <Progress value={result.score} className="h-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="h-5 w-5" /> Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4" /> AI Sales Pitch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-4">{result.sales_pitch}</p>
                <div className="bg-background/50 p-3 rounded-md border border-primary/20 text-center font-mono text-sm font-bold text-primary">
                  {result.personalized_offer}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
