import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LogInPage from './LogInPage';
import RegisterPage from './RegisterPage'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;