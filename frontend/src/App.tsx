import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ChatDashboard from './pages/Chat';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import ProjectDetail from './pages/ProjectDetail';
import Orders from './pages/Orders';
import AdminPayouts from './pages/AdminPayouts';
import AdminSettings from './pages/AdminSettings';
import { AuthContext } from './context/AuthContext';

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
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="project/:slug" element={<ProjectDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="chat" element={<ProtectedRoute><ChatDashboard /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="admin-payouts" element={<ProtectedRoute><AdminPayouts /></ProtectedRoute>} />
          <Route path="admin-settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="create-product" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
          <Route path="edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="edit-project/:slug" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
          <Route path="*" element={<div style={{ textAlign: 'center', padding: '100px', fontSize: '24px' }}>Page Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
