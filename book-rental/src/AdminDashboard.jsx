import { useState } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "./img/full_logo.png";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const [books, setBooks] = useState(JSON.parse(localStorage.getItem("books")) || []);
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem("users")) || []);
  const [rentals] = useState(JSON.parse(localStorage.getItem("rentals")) || []);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Ogólna");
  const [year, setYear] = useState("");
  const [copies, setCopies] = useState(1);

  if (!user || user.role !== "admin") {
    return <h2>Brak dostępu – tylko administrator</h2>;
  }

  /* ======================
     ZASOBY
     ====================== */
  const addBook = (e) => {
    e.preventDefault();

    const newBook = {
      id: Date.now(),
      title,
      author,
      category,
      year,
      availableCopies: Number(copies),
      active: true
    };

    const updated = [...books, newBook];
    setBooks(updated);
    localStorage.setItem("books", JSON.stringify(updated));

    setTitle("");
    setAuthor("");
    setCategory("Ogólna");
    setYear("");
    setCopies(1);
  };

  const toggleBookStatus = (id) => {
    const updated = books.map(b =>
      b.id === id ? { ...b, active: !b.active } : b
    );
    setBooks(updated);
    localStorage.setItem("books", JSON.stringify(updated));
  };

  const deleteBook = (id) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    localStorage.setItem("books", JSON.stringify(updated));
  };

  /* ======================
     UŻYTKOWNICY
     ====================== */
  const toggleBlockUser = (id) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, blocked: !u.blocked } : u
    );
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  const verifyUser = (id) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, verified: true } : u
    );
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  /* ======================
     RAPORTY
     ====================== */
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.blocked).length;
  const totalBooks = books.length;
  const totalRentals = rentals.length;

  const categoryStats = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  /* ======================
     LOGOUT
     ====================== */
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  return (
    <div>
      <header className="header">
        <img src={fullLogo} alt="Logo" className="logo" />
      </header>

      <div className="admin-dashboard">
        <h1>Panel administratora 🛠️</h1>
        <button onClick={logout} className="loginBtn">Wyloguj</button>

        {/* DODAWANIE */}
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
        </section>

        {/* KATALOG */}
        <section className="books-section">
          <h2>Katalog książek</h2>
          {books.map(b => (
            <div key={b.id} className="book-card">
              <strong>{b.title}</strong> – {b.author}
              <p>Kategoria: {b.category} | Rok: {b.year}</p>
              <p>Egzemplarze: {b.availableCopies}</p>
              <p>Status: {b.active ? "Aktywna" : "Ukryta"}</p>
              <button onClick={() => toggleBookStatus(b.id)}>
                {b.active ? "Ukryj" : "Aktywuj"}
              </button>
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
                <button onClick={() => toggleBlockUser(u.id)}>
                  {u.blocked ? "Odblokuj" : "Zablokuj"}
                </button>
                {!u.verified && (
                  <button onClick={() => verifyUser(u.id)}>Zweryfikuj</button>
                )}
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
