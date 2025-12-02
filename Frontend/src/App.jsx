import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import UploadProject from './pages/UploadProject';
import TestGenerator from './pages/TestGenerator';
import TestRunner from './pages/TestRunner';
import ResultsHistory from './pages/ResultsHistory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<UploadProject />} />
              <Route path="generate" element={<TestGenerator />} />
              <Route path="run" element={<TestRunner />} />
              <Route path="results" element={<ResultsHistory />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
