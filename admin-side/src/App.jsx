import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Components/login/Login'
import Nav from './Components/layout/Nav'
import { Navigate, Route, Routes } from 'react-router-dom'
import Register from './Components/login/Register'
import Layout from './Components/layout/Layout'
import Dashboard from './Components/layout/Dashboard'
import Academics from './Components/layout/Academics'
import Reading from './Components/layout/Reading'
import Resources from './Components/layout/Resources'
import Exam from './Components/layout/Exam'

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        <Route path="/admin/" element={<Layout />}>
          <Route path="/admin/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/academics" element={<Academics />} />
          <Route path="/admin/reading" element={<Reading />} />
          <Route path="/admin/resources" element={<Resources />} />
          <Route path="/admin/exams" element={<Exam  />} />
        </Route>
      </Routes>
    </>
  );
}

export default App
