import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Trading } from './pages/Trading';
import { Mining } from './pages/Mining';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { TaskManager } from './pages/admin/TaskManager';
import { AuthProvider } from './components/AuthProvider';
import { AuthRequired } from './components/AuthRequired';
import { useOrders } from './hooks/useOrders';

function App() {
  // Initialize orders subscription
  useOrders();

  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthRequired>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/trading" replace />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/mining" element={<Mining />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route 
                path="/admin/tasks" 
                element={
                  <AuthRequired requireAdmin>
                    <TaskManager />
                  </AuthRequired>
                } 
              />
            </Routes>
          </Layout>
        </AuthRequired>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;