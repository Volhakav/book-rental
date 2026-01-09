import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "./img/full_logo.png";
import axios from "axios";


export default function AdminDashboard() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const [user, setUser] = useState(() => {
    if (!storedUser) return null;
    return {
      id: storedUser.id,
      name: storedUser.name || "Administrator",
      surname: storedUser.surname || "",
      email: storedUser.email || storedUser.login || "",
      role: storedUser.role || storedUser.rola || "admin",
      blocked: storedUser.blocked ?? false,
      preferences: storedUser.preferences ?? { notifications: false },
    };
  });

  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");

  // Form do dodawania książek
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Ogólna");
  const [year, setYear] = useState("");
  const [copies, setCopies] = useState(1);

  // Edycja profilu
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
  });

  

  // Pobieranie danych z localStorage
  useEffect(() => {
    setBooks(JSON.parse(localStorage.getItem("books")) || []);
    setUsers(JSON.parse(localStorage.getItem("users")) || []);
    setRentals(JSON.parse(localStorage.getItem("rentals")) || []);
  }, []);

  if (!user || user.blocked) {
    return <h2>Brak dostępu lub konto zablokowane</h2>;
  }

  useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }

        const role = storedUser.role || storedUser.rola;

        if (role?.toLowerCase() !== "admin") {
            navigate("/dashboard");
        }

    }, [navigate, storedUser]);


  /* =========================
     PROFIL
  ========================= */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

 const saveProfile = async () => {
        try {
            const response = await fetch(`http://localhost:8082/api/konto/${user.id}/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login: profileForm.email,
                    name: profileForm.name,
                    surname: profileForm.surname,
                    rola: user.role
                }),
            });

            if (!response.ok) throw new Error("Błąd zapisu profilu");

            const data = await response.json(); // backend zwraca KontoDTO

            const updatedUser = {
                id: data.id,
                name: data.name,
                surname: data.surname,
                email: data.login,
                role: data.rola || user.role || "admin",
                blocked: user.blocked,
                preferences: user.preferences
            };

            setUser(updatedUser);
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
            setEditProfile(false);

        } catch (err) {
            console.error(err);
            alert("Nie udało się zapisać profilu");
        }
    };





  const toggleNotifications = () => {
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        notifications: !user.preferences.notifications,
      },
    };
    setUser(updatedUser);
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  /* =========================
     KSIĄŻKI
  ========================= */


    const addBook = async (e) => {
        e.preventDefault();
        try {
            const newBook = {
                tytul: title,
                autor: author,
                rokWydania: Number(year),
                kategoriaId: category === "Ogólna" ? 1 : category === "Fantasy" ? 2 : category === "Nauka" ? 3 : 4
            };

            const response = await axios.post("http://localhost:8082/api/ksiazki", newBook);
            const savedBook = response.data;

            setBooks((prev) => [...prev, savedBook]);
            setTitle("");
            setAuthor("");
            setCategory("Ogólna");
            setYear("");
            setCopies(1);
        } catch (err) {
            console.error("Błąd dodawania książki:", err);
            alert("Nie udało się dodać książki");
        }
    };



    const toggleBookStatus = async (id) => {
        try {
            const book = books.find(b => b.id === id);
            const updatedBook = { ...book, active: !book.active };

            const response = await axios.put(`http://localhost:8082/api/ksiazki/${id}`, updatedBook);
            const savedBook = response.data;

            setBooks((prev) => prev.map(b => b.id === id ? savedBook : b));
        } catch (err) {
            console.error("Błąd zmiany statusu książki:", err);
            alert("Nie udało się zmienić statusu książki");
        }
    };

    const deleteBook = async (id) => {
        try {
            await axios.delete(`http://localhost:8082/api/ksiazki/${id}`);
            setBooks((prev) => prev.filter(b => b.id !== id));
        } catch (err) {
            console.error("Błąd usuwania książki:", err);
            alert("Nie udało się usunąć książki");
        }
    };


  /* =========================
     UŻYTKOWNICY
  ========================= */
  const toggleBlockUser = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  const verifyUser = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, verified: true } : u);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  /* =========================
     RAPORTY
  ========================= */
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.blocked).length;
  const totalBooks = books.length;
  const totalRentals = rentals.length;

  const categoryStats = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  /* =========================
     JSX
  ========================= */
  return (
    <div className="dashboard-page">
      <header className="header">
        <img src={fullLogo} alt="Logo" className="logo" />
      </header>

      <div className="admin-dashboard">
        {/* GÓRA */}
        <div className="dashboard-top">
          <h1>Panel administratora 🛠️</h1>
          <button onClick={logout} className="loginBtn">Wyloguj</button>
        </div>

        {/* PROFIL */}
        <section className="profile-section">
          <h2>Profil administratora</h2>
          {!editProfile ? (
            <>
              <p><strong>Imię:</strong> {user.name}</p>
              <p><strong>Nazwisko:</strong> {user.surname}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Powiadomienia:</strong> {user.preferences.notifications ? "Włączone" : "Wyłączone"}</p>
              <div className="profile-actions">
                <button onClick={() => setEditProfile(true)}>Edytuj profil</button>
                <button onClick={toggleNotifications}>Zmień powiadomienia</button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-form">
                <label>Imię<input name="name" value={profileForm.name} onChange={handleProfileChange} /></label>
                <label>Nazwisko<input name="surname" value={profileForm.surname} onChange={handleProfileChange} /></label>
                <label>Email<input name="email" value={profileForm.email} onChange={handleProfileChange} /></label>
              </div>
              <div className="profile-actions">
                <button onClick={saveProfile}>Zapisz</button>
                <button className="danger" onClick={() => setEditProfile(false)}>Anuluj</button>
              </div>
            </>
          )}
        </section>

        {/* KSIĄŻKI */}
        <section className="books-section">
          <h2>Dodaj książkę</h2>
          <form onSubmit={addBook} className="admin-form">
            <input placeholder="Tytuł" value={title} onChange={e => setTitle(e.target.value)} required />
            <input placeholder="Autor" value={author} onChange={e => setAuthor(e.target.value)} required />
            <input placeholder="Rok wydania" value={year} onChange={e => setYear(e.target.value)} />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option>Ogólna</option>
              <option>Fantasy</option>
              <option>Nauka</option>
              <option>Historia</option>
            </select>
            <input type="number" min="1" value={copies} onChange={e => setCopies(e.target.value)} />
            <button type="submit">Dodaj</button>
          </form>

          <h2>Katalog książek</h2>
          {books.map(b => (
                <div key={b.id} className="book-card">
                    <strong>{b.tytul}</strong> – {b.autor}
                    <p>Kategoria: {b.kategoria} | Rok: {b.rokWydania}</p>
                    <p>Egzemplarze: {b.availableCopies ?? 1}</p>
                    <p>Status: {b.active ? "Aktywna" : "Ukryta"}</p>
                    <button onClick={() => toggleBookStatus(b.id)}>{b.active ? "Ukryj" : "Aktywuj"}</button>
                    <button className="delete" onClick={() => deleteBook(b.id)}>Usuń</button>
                </div>
            ))}

        </section>

        {/* UŻYTKOWNICY */}
        <section className="users-section">
          <h2>Użytkownicy</h2>
          {users.map(u => (
            <div key={u.id} className="user-card">
              <strong>{u.name} {u.surname}</strong> – {u.email}
              {!u.verified && <span className="warning">Niezweryfikowany</span>}
              <div>
                <button onClick={() => toggleBlockUser(u.id)}>{u.blocked ? "Odblokuj" : "Zablokuj"}</button>
                {!u.verified && <button onClick={() => verifyUser(u.id)}>Zweryfikuj</button>}
              </div>
            </div>
          ))}
        </section>

        {/* RAPORTY */}
        <section className="reports-section">
          <h2>Raporty systemowe</h2>
          <p>Użytkownicy: {totalUsers} (aktywni: {activeUsers})</p>
          <p>Książki: {totalBooks}</p>
          <p>Wypożyczenia: {totalRentals}</p>
          <h3>Popularność kategorii</h3>
          <ul>
            {Object.entries(categoryStats).map(([cat, count]) => (
              <li key={cat}>{cat}: {count}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
