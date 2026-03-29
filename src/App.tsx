import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CommunityPage from './pages/CommunityPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/community" element={<CommunityPage />} />
    </Routes>
  );
}
