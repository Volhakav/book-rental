import { useState } from 'react'
import './App.css'
import LogInPage from './LogInPage.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LogInPage />
    </>
  )
}

export default App
