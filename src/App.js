import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Incidents from './components/Incidents';
import IncidentDetail from './components/IncidentDetail';
import IncidentManagement from './components/IncidentManagement';
import Models from './components/Models';
import AddModel from './components/AddModel';
import EditModel from './components/EditModel';
import Anomalies from './components/Anomalies';
import AnomalyDetail from './components/AnomalyDetail';
import AnomaliesChatAssistant from './components/AnomaliesChatAssistant';
import AnomaliesListChatAssistant from './components/AnomaliesListChatAssistant';
import Runbooks from './components/Runbooks';
import RunbookDetail from './components/RunbookDetail';
import AddRunbook from './components/AddRunbook';
import Reports from './components/Reports';
import IncidentSummaryReport from './components/IncidentSummaryReport';
import ModelPerformanceReport from './components/ModelPerformanceReport';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import Settings from './components/Settings';
import SystemSettings from './components/SystemSettings';
import SecuritySettings from './components/SecuritySettings';
import NotificationSettings from './components/NotificationSettings';
import ModelSettings from './components/ModelSettings';
import IntegrationSettings from './components/IntegrationSettings';
import Observability from './components/Observability';
import UserBehaviour from './components/UserBehaviour';
import ChatAssistant from './components/ChatAssistant';

function AppContent() {
  const location = useLocation();
  
  // Hide global chat assistant on pages that have their own chat systems
  const hideGlobalChatPaths = [
    '/incidents/',  // Any incident detail or management page  
    '/models/add',  // Add model form
    '/models/edit/', // Edit model form
    '/runbooks/add', // Add runbook form
    '/runbooks/', // All runbook pages now have their own chat
    '/runbooks', // Runbook list page
    '/reports/', // Report detail pages
    '/settings/' // Settings pages
  ];
  
  // Show anomalies chat assistant on any anomaly-related page
  const isAnomalyPage = location.pathname.startsWith('/anomalies');
  const isAnomaliesListingPage = location.pathname === '/anomalies';
  const isAnomalyDetailPage = location.pathname.startsWith('/anomalies/') && location.pathname !== '/anomalies';
  
  const shouldShowChat = !hideGlobalChatPaths.some(path => location.pathname.includes(path));

  return (
    <div className="App">
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id/manage" element={<IncidentManagement />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/anomalies/:anomalyId" element={<AnomalyDetail />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/add" element={<AddModel />} />
          <Route path="/models/edit/:id" element={<EditModel />} />
          <Route path="/runbooks" element={<Runbooks />} />
          <Route path="/runbooks/add" element={<AddRunbook />} />
          <Route path="/runbooks/:name" element={<RunbookDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/incident-summary" element={<IncidentSummaryReport />} />
          <Route path="/reports/model-performance" element={<ModelPerformanceReport />} />
          <Route path="/reports/executive-dashboard" element={<ExecutiveDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/system" element={<SystemSettings />} />
          <Route path="/settings/security" element={<SecuritySettings />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/models" element={<ModelSettings />} />
          <Route path="/settings/integrations" element={<IntegrationSettings />} />
          <Route path="/observability" element={<Observability />} />
          <Route path="/user-behaviour" element={<UserBehaviour />} />
        </Routes>
        {shouldShowChat && !isAnomalyPage && <ChatAssistant />}
        {isAnomaliesListingPage && <AnomaliesListChatAssistant />}
        {isAnomalyDetailPage && (
          <AnomaliesChatAssistant 
            currentAnomalyId={location.pathname.split('/anomalies/')[1]}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;
