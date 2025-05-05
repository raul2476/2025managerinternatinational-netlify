import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentRegistry from './pages/DocumentRegistry';
import Reports from './pages/Reports';
import Operations from './pages/Operations';
import ServiceProviders from './pages/ServiceProviders';
import Clients from './pages/Clients';
import Fleet from './pages/Fleet';
import { LanguageProvider } from './contexts/LanguageContext';
import { OperationsProvider } from './contexts/OperationsContext';
import { ServiceProvidersProvider } from './contexts/ServiceProvidersContext';
import { ClientsProvider } from './contexts/ClientsContext';
import { FleetProvider } from './contexts/FleetContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ClientsProvider>
        <ServiceProvidersProvider>
          <OperationsProvider>
            <FleetProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="operations" element={<Operations />} />
                    <Route path="providers" element={<ServiceProviders />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="documents" element={<DocumentRegistry />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="fleet" element={<Fleet />} />
                  </Route>
                </Routes>
              </Router>
            </FleetProvider>
          </OperationsProvider>
        </ServiceProvidersProvider>
      </ClientsProvider>
    </LanguageProvider>
  );
}

export default App;