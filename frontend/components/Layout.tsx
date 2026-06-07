import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  FileText, 
  Megaphone,
  FileCode,
  Cpu,
  Settings,
  Blocks,
  BookOpen
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inbox', label: 'Omnichannel Inbox', icon: MessageSquare },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/pipeline', label: 'Sales Pipeline', icon: Users },
  { path: '/cv-analyzer', label: 'AI CV Analyzer', icon: FileText },
  { path: '/broadcasts', label: 'Broadcasts', icon: Megaphone },
  { path: '/templates', label: 'Templates', icon: FileCode },
  { path: '/integrations', label: 'Integrations', icon: Blocks },
  { path: '/ai-status', label: 'AI Status', icon: Cpu },
  { path: '/docs', label: 'System Architecture', icon: BookOpen },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-sidebar-border bg-sidebar shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Cpu className="w-6 h-6" />
            <span>CVPRO AI</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
