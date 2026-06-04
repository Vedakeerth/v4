import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/secure-management-portal/login" element={<LoginPage />} />
        <Route path="/secure-management-portal/admin" element={<AdminPage />} />
        {/* Redirect root to admin */}
        <Route path="/" element={<Navigate to="/secure-management-portal/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
