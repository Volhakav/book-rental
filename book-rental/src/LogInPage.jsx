import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fullLogo from './img/full_logo.png';

export default function LogInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      user => user.email === email && user.password === password
    );

    if (!foundUser) {
      alert("Nieprawidłowy email lub hasło");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(foundUser));

    // 🔹 przekierowanie w zależności od roli
    if (foundUser.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
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

          <button type="submit" className="loginBtn">Zaloguj się</button>
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
