import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Components/login/Login'
import Nav from './Components/layout/Nav'
import { Route, Routes } from 'react-router-dom'
import Register from './Components/login/Register'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Nav />
      {/* <Login/> */}

      <Routes>
        <Route path="/admin/" element={<Login />} />
        <Route path="/admin/signup" element={<Register/>} />
      </Routes>
    </>
  );
}

export default App
