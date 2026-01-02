import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogInPage from "./LogInPage";
import RegisterPage from "./RegisterPage";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
