import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import fullLogo from "./img/full_logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState(""); // nowa
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [accountType, setAccountType] = useState("user"); 
  const [employeeCode, setEmployeeCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja podstawowa
    if (!name || !email || !password || !birthDate) {
      alert("Imię, email, hasło i data urodzenia są wymagane");
      return;
    }

    // Walidacja wieku (>=13 lat)
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    if (age < 13 || (age === 13 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
      alert("Musisz mieć co najmniej 13 lat, aby się zarejestrować");
      return;
    }

    // Sprawdzenie zgodności haseł
    if (password !== confirmPassword) {
      alert("Hasła nie zgadzają się!");
      return;
    }

    try {
      if (accountType === "admin") {
        if (employeeCode !== "99999999") {
          alert("Nieprawidłowy kod dostępu pracownika!");
          return;
        }

        // Konto pracownika/admina
        await axios.post("http://localhost:8082/api/konto", {
          name,
          surname,
          email: email,
          password: password,
          role: "admin",
          birthDate
        });

        alert("Konto pracownika/admina utworzone!");
        navigate("/");
      } else {
        // Konto zwykłego użytkownika
        await axios.post("http://localhost:8082/api/konto", {
          name,
          surname,
          email: email,
          password: password,
          role: "user",
          birthDate
        });

        alert("Konto użytkownika utworzone!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert("Błąd rejestracji: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="register-page">
      <header className="header">
        <img src={fullLogo} alt="Logo wypożyczalni" className="logo" />
      </header>

      <main className="login-container">
        <h2>Zarejestruj się</h2>

        <form className="logIn" id="registerForm" onSubmit={handleSubmit}>
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
            <label htmlFor="birthDate">Data urodzenia:</label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
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
            <label htmlFor="confirmPassword">Powtórz hasło:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountType">Typ konta:</label>
            <select
              id="accountType"
              value={accountType}
              onChange={e => setAccountType(e.target.value)}
            >
              <option value="user">Użytkownik</option>
              <option value="admin">Pracownik / Admin</option>
            </select>
          </div>

          {accountType === "admin" && (
            <div className="form-group">
              <label htmlFor="employeeCode">Kod dostępu pracownika:</label>
              <input
                id="employeeCode"
                type="text"
                value={employeeCode}
                onChange={e => setEmployeeCode(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="registerBtn">
            Zarejestruj się
          </button>
        </form>

        <div className="signUp-link">
          Masz konto? <Link to="/login">Zaloguj się</Link>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Wypożyczalnia Książek</p>
      </footer>
    </div>
  );
}
