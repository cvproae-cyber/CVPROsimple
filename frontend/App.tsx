import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Inbox } from './views/Inbox';
import { Pipeline } from './views/Pipeline';
import { CVAnalyzer } from './views/CVAnalyzer';
import { Contacts } from './views/Contacts';
import { Broadcasts } from './views/Broadcasts';
import { Templates } from './views/Templates';
import { AIStatus } from './views/AIStatus';
import { Integrations } from './views/Integrations';
import { Documentation } from './views/Documentation';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/cv-analyzer" element={<CVAnalyzer />} />
          <Route path="/broadcasts" element={<Broadcasts />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/ai-status" element={<AIStatus />} />
          <Route path="/docs" element={<Documentation />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
