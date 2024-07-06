import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Components/login/Login'
import Nav from './Components/Navigation/Nav'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Nav/>
      <Login/>
    </>
  )
}

export default App
