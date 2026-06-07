import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '../components/ui';
import { Database, Cloud, MessageCircle, CreditCard, FileSearch, Mic, ShieldCheck, BarChart4, ArrowRight, Workflow, Cpu, Video, Send, Mail } from 'lucide-react';

export const Integrations: React.FC = () => {
  const integrations = [
    {
      title: "n8n Workflow Automation",
      description: "The core backend engine. Connects Meta Webhooks, Database, and Gemini API.",
      icon: <Workflow className="w-6 h-6 text-orange-500" />,
      status: "Required",
      category: "Backend"
    },
    {
      title: "Supabase / PostgreSQL",
      description: "Real-time database to store customers, messages, and AI embeddings.",
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      status: "Required",
      category: "Database"
    },
    {
      title: "Meta Graph API",
      description: "Official WhatsApp Business, Facebook, and Instagram DM integration.",
      icon: <MessageCircle className="w-6 h-6 text-green-500" />,
      status: "Required",
      category: "Channels"
    },
    {
      title: "TikTok Business API",
      description: "Capture leads from TikTok Lead Generation forms and DMs.",
      icon: <Video className="w-6 h-6 text-white" />,
      status: "Recommended",
      category: "Channels"
    },
    {
      title: "Telegram Bot API",
      description: "Automate responses in Telegram channels and direct messages.",
      icon: <Send className="w-6 h-6 text-blue-400" />,
      status: "Recommended",
      category: "Channels"
    },
    {
      title: "Email (SMTP/IMAP)",
      description: "Send formal proposals and final CV documents via Email.",
      icon: <Mail className="w-6 h-6 text-red-400" />,
      status: "Recommended",
      category: "Channels"
    },
    {
      title: "Google Document AI",
      description: "Advanced OCR for parsing complex PDF and Word CVs accurately.",
      icon: <FileSearch className="w-6 h-6 text-indigo-400" />,
      status: "Recommended",
      category: "AI & Processing"
    },
    {
      title: "Payment Gateway (PayTabs/Stripe)",
      description: "Generate payment links directly in chat to close sales instantly.",
      icon: <CreditCard className="w-6 h-6 text-purple-400" />,
      status: "Planned",
      category: "Sales"
    }
  ];

  return (
    <div className="p-8 space-y-6 flex-1 overflow-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Architecture & Integrations</h1>
          <p className="text-muted-foreground mt-1">How to turn this frontend dashboard into a fully functional production system.</p>
        </div>
      </div>

      {/* How it works section */}
      <Card className="mt-6 bg-card border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary">How the Full System Works</CardTitle>
          <CardDescription>The data flow from the customer to the AI and back to this dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
            <div className="flex flex-col items-center text-center space-y-2 w-32">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                <MessageCircle className="w-8 h-8 text-green-500" />
              </div>
              <span className="text-sm font-medium">1. Customer</span>
              <span className="text-xs text-muted-foreground">Sends WhatsApp Msg</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
            
            <div className="flex flex-col items-center text-center space-y-2 w-32">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50">
                <Workflow className="w-8 h-8 text-orange-500" />
              </div>
              <span className="text-sm font-medium">2. n8n (Backend)</span>
              <span className="text-xs text-muted-foreground">Receives Webhook</span>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />

            <div className="flex flex-col items-center text-center space-y-2 w-32">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                <Cpu className="w-8 h-8 text-blue-500" />
              </div>
              <span className="text-sm font-medium">3. Gemini AI</span>
              <span className="text-xs text-muted-foreground">Generates Reply</span>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />

            <div className="flex flex-col items-center text-center space-y-2 w-32">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                <Database className="w-8 h-8 text-emerald-500" />
              </div>
              <span className="text-sm font-medium">4. Database</span>
              <span className="text-xs text-muted-foreground">Saves Chat History</span>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />

            <div className="flex flex-col items-center text-center space-y-2 w-32">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                <BarChart4 className="w-8 h-8 text-indigo-500" />
              </div>
              <span className="text-sm font-medium">5. This Dashboard</span>
              <span className="text-xs text-muted-foreground">Reads from DB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {integrations.map((item, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-secondary/30 rounded-lg">
                  {item.icon}
                </div>
                <Badge 
                  variant={item.status === 'Connected' ? 'default' : item.status === 'Required' ? 'destructive' : 'secondary'}
                  className={item.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : ''}
                >
                  {item.status}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-4">{item.title}</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider mt-1 text-primary/80">
                {item.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {item.description}
              </p>
              <Button variant={item.status === 'Connected' ? 'outline' : 'secondary'} className="w-full">
                {item.status === 'Connected' ? 'Configure' : 'View Setup Guide'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
