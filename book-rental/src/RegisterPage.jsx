import { useState } from "react";
import { Link } from "react-router-dom";
import fullLogo from './img/full_logo.png';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }
    console.log("Rejestracja:", { name, email, password });
    // Tutaj logika rejestracji
  }

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
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Nazwisko:</label>
            <input
              id="surname"
              type="text"
              value={name}
              onChange={(e) => setSurname(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
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