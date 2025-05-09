// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Yükleniyor...</div>;
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Yükleniyor...</div>;
  return !currentUser ? <Outlet /> : <Navigate to="/chat" />;
};

const NavigateBasedOnAuth = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Yükleniyor...</div>;
  return currentUser ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/chat" element={<ChatPage />} />
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
          </Route>
          <Route path="*" element={<NavigateBasedOnAuth />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;