import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import fullLogo from "./img/full_logo.png";


export default function LogInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ DOMYŚLNY ADMIN – TYLKO RAZ
  useEffect(() => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const updatedUsers = users.filter(u => u.email !== "admin@gmail.com");

  updatedUsers.push({
    id: 1,
    name: "Admin",
    surname: "System",
    email: "admin@gmail.com",
    password: "!admin123",
    role: "admin",
    blocked: false,
    verified: true,
    preferences: {
      language: "pl",
      notifications: false
    }
  });

  localStorage.setItem("users", JSON.stringify(updatedUsers));
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8082/api/konto/login", {
        email,
        password
      });

      const loggedUser = response.data; // zakładamy, że backend zwraca DTO konta
      localStorage.setItem("loggedInUser", JSON.stringify(loggedUser));

      if (loggedUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error(error);
      alert("Nieprawidłowy email lub hasło");
    }
  };


  return (
    <div className="login-page">
      <header className="header">
        <img src={fullLogo} alt="Logo wypożyczalni" className="logo" />
      </header>

      <main className="login-container">
        <h2>Witaj na naszej stronie wypożyczalni książek!</h2>

        <form className="logIn" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="registerBtn">Zaloguj się</button>
        </form>

        <div className="signUp-link">
          <Link to="/register">Zarejestruj się</Link>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Wypożyczalnia Książek</p>
      </footer>
    </div>
  );
}
