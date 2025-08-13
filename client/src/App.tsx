import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.scss';

// Layout components
import Layout from './components/Layout/Layout';

// Contract pages
import CreateContract from './page/Contract/CreateContract/CreateContract';
import ContractCollection from './page/Contract/ContractCollection/ContractCollection';
import ContractDraft from './page/Contract/ContractDraft/ContractDraft';
import TemplateManagement from './page/Contract/TemplateManagement/TemplateManagement';

// Auth pages
import Login from './page/Auth/Login/Login';
import Register from './page/Auth/Register/Register';
import ForgotPassword from './page/Auth/ForgotPassword/ForgotPassword';
import ResetPassword from './page/Auth/ResetPassword/ResetPassword';

// Other pages
import Dashboard from './page/Dashboard/Dashboard';
import Profile from './page/Profile/Profile';
import Settings from './page/Settings/Settings';
import Unauthorized from './page/Unauthorized/Unauthorized';
import NotFound from './page/NotFound/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

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

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={['admin']}>
                <Layout>
                  <div>Admin Dashboard</div>
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

            {/* 404 Page */}
            <Route path="/404" element={<NotFound />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
