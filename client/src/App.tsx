import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.scss';

// Layout components
import Layout from './components/Layout/Layout';

// Contract pages
import CreateContract from './page/Contract/CreateContract/CreateContract';
import ContractCollection from './page/Contract/ContractCollection/ContractCollection';
import ContractDraft from './page/Contract/ContractDraft/ContractDraft';
import TemplateManagement from './page/Contract/TemplateManagement/TemplateManagement';

// Other pages (existing)
import Dashboard from './page/Dashboard/Dashboard';
import Login from './page/Auth/Login/Login';
import Register from './page/Auth/Register/Register';
import Profile from './page/Profile/Profile';
import Settings from './page/Settings/Settings';

// Auth context
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  // Protected Route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Contract Management Routes */}
          <Route path="/contracts" element={
            <ProtectedRoute>
              <Layout>
                <CreateContract onMethodSelect={(method) => console.log('Method selected:', method)} />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/contracts/collection" element={
            <ProtectedRoute>
              <Layout>
                <ContractCollection onSelect={(type, data) => console.log('Selected:', type, data)} />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/contracts/draft" element={
            <ProtectedRoute>
              <Layout>
                <ContractDraft />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/contracts/draft/:id" element={
            <ProtectedRoute>
              <Layout>
                <ContractDraft />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/contracts/templates" element={
            <ProtectedRoute>
              <Layout>
                <TemplateManagement mode="basic" />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/contracts/templates/editor" element={
            <ProtectedRoute>
              <Layout>
                <TemplateManagement mode="editor" />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Other protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
