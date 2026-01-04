import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fullLogo from "./img/full_logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedUser?.role === "admin";

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    consent: false,
    role: "user", // domyślnie zwykły użytkownik
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sprawdzenie haseł
    if (form.password !== form.confirmPassword) {
      alert("Hasła nie są identyczne");
      return;
    }

    // Weryfikacja wieku
    const age =
      new Date().getFullYear() - new Date(form.birthDate).getFullYear();
    if (age < 13) {
      alert("Musisz mieć minimum 13 lat");
      return;
    }

    // Zgoda RODO
    if (!form.consent) {
      alert("Musisz zaakceptować zgodę RODO");
      return;
    }

    // Sprawdzenie czy email już istnieje
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some((u) => u.email === form.email)) {
      alert("Użytkownik z tym emailem już istnieje");
      return;
    }

    // Tworzenie nowego użytkownika
    const newUser = {
      id: Date.now(),
      name: form.name,
      surname: form.surname,
      email: form.email,
      password: form.password,
      birthDate: form.birthDate,
      role: form.role, // rola zgodnie z wyborem
      verified: true,
      blocked: false,
      preferences: {
        language: "pl",
        notifications: true,
      },
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Rejestracja zakończona sukcesem!");
    navigate("/");
  };

  return (
    <div className="register-page">
      <header className="header">
        <img src={fullLogo} alt="Logo wypożyczalni" className="logo" />
      </header>

      <main className="login-container">
        <h2>Rejestracja</h2>

        <form className="logIn" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Imię</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Nazwisko</label>
            <input name="surname" value={form.surname} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Data urodzenia</label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Hasło</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Powtórz hasło</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} /> Akceptuję zgodę RODO
            </label>
          </div>

          {/* Wybór roli — tylko admin widzi opcję admin */}
          {isAdmin && (
            <div className="form-group">
              <label>Rola użytkownika</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Użytkownik</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" className="registerBtn">Zarejestruj się</button>
        </form>

        <div className="signUp-link">
          <p>
            Masz już konto? <Link to="/">Zaloguj się</Link>
          </p>
        </div>
      </main>

      <footer className="footer">© 2025 Wypożyczalnia Książek</footer>
    </div>
  );
}
