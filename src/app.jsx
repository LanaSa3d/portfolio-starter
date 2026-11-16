import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './layout.jsx'
import { Home } from './home.jsx'
import { ProjectPage } from './project-page.jsx'
import { AdminPage } from './admin.jsx'
import { NotFound } from './not-found.jsx'

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
