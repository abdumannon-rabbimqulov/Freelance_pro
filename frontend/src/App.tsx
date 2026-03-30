import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateProduct from './pages/CreateProduct';
import ChatDashboard from './pages/Chat';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Maxsus himoyalangan marshrut kompoentasi (Faqat tizimga kirganlar o'ta oladi)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route 
            path="chat" 
            element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="create-product" 
            element={
              <ProtectedRoute>
                <CreateProduct />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<div style={{ textAlign: 'center', padding: '100px', fontSize: '24px' }}>Page Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
