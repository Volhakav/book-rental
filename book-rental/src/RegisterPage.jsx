import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fullLogo from './img/full_logo.png';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // domyślnie "user"
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // sprawdzamy, czy email już istnieje
    if (users.some(u => u.email === email)) {
      alert("Użytkownik z tym emailem już istnieje");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      surname,
      email,
      password,
      role, // "user" lub "admin"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Rejestracja zakończona sukcesem!");

    navigate("/"); // po rejestracji wracamy do logowania
  };

  return (
    <div className="register-page">
      <header className="header">
        <img src={fullLogo} alt="Logo wypożyczalni" className="logo" />
      </header>

      <main className="login-container">
        <h2>Zarejestruj się</h2>

        <form className="logIn" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Imię:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="surname">Nazwisko:</label>
            <input
              id="surname"
              type="text"
              value={surname}
              onChange={e => setSurname(e.target.value)}
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Opcja wybory roli tylko do testów */}
          <div className="form-group">
            <label>Rola:</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">Użytkownik</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="loginBtn">Zarejestruj się</button>
        </form>

        <div className="signUp-link">
          <p>Masz już konto? <Link to="/">Zaloguj się</Link></p>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Wypożyczalnia Książek</p>
      </footer>
    </div>
  );
}
