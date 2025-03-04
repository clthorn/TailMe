import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatorDashboard from './pages/CreatorDashboard';
import UserDashboard from './pages/UserDashboard';
import CreatorProfile from './pages/CreatorProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import AddPick from './pages/AddPick';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ 
  children: React.ReactElement, 
  requireCreator?: boolean 
}> = ({ children, requireCreator = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireCreator && !user.isCreator) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppContent: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/creator-dashboard" 
            element={
              <ProtectedRoute requireCreator>
                <CreatorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/creator/:id" element={<CreatorProfile />} />
          <Route 
            path="/add-pick" 
            element={
              <ProtectedRoute requireCreator>
                <AddPick />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
