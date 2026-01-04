import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from './img/full_logo.png';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const [books, setBooks] = useState(JSON.parse(localStorage.getItem("books")) || []);
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem("users")) || []);
  const [rentals, setRentals] = useState(JSON.parse(localStorage.getItem("rentals")) || []);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [copies, setCopies] = useState(1);

  // Sprawdzenie, czy admin
  if (!user || user.role !== "admin") {
    return <h2>Brak dostępu – tylko administrator</h2>;
  }

  //  Dodawanie książki
  const addBook = (e) => {
    e.preventDefault();
    const newBook = { id: Date.now(), title, author, availableCopies: Number(copies) };
    const updated = [...books, newBook];
    setBooks(updated);
    localStorage.setItem("books", JSON.stringify(updated));
    setTitle(""); setAuthor(""); setCopies(1);
  };

  //  Edytowanie książki
  const editBook = (id) => {
    const book = books.find(b => b.id === id);
    const newTitle = prompt("Nowy tytuł:", book.title);
    const newAuthor = prompt("Nowy autor:", book.author);
    const newCopies = prompt("Nowa liczba egzemplarzy:", book.availableCopies);
    if (!newTitle || !newAuthor || !newCopies) return;
    const updated = books.map(b => b.id === id ? { ...b, title: newTitle, author: newAuthor, availableCopies: Number(newCopies) } : b);
    setBooks(updated);
    localStorage.setItem("books", JSON.stringify(updated));
  };

  //  Usuwanie książki
  const deleteBook = (id) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    localStorage.setItem("books", JSON.stringify(updated));
  };

  //  Blokowanie/odblokowywanie użytkownika
  const toggleBlockUser = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  //  Resetowanie hasła użytkownika
  const resetPassword = (id) => {
    const newPassword = prompt("Wprowadź nowe hasło:");
    if (!newPassword) return;
    const updated = users.map(u => u.id === id ? { ...u, password: newPassword } : u);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  //  Wylogowanie
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  // Raporty
  const overdueRentals = rentals.filter(r => new Date(r.dueDate) < new Date());
  const rentalStats = books.map(b => ({
    title: b.title,
    rentals: rentals.filter(r => r.bookId === b.id).length
  }));

  return (
    <div>
      <header className="header">
        <img src={fullLogo} alt="Logo" className="logo" />
      </header>

      <div className="admin-dashboard">
        <h1>Panel administratora 🛠️</h1>
        <button onClick={logout} className="loginBtn">Wyloguj</button>
        {/*  Dodawanie książki */}
        <section className="books-section">
          <h2>Dodaj książkę</h2>
          <form onSubmit={addBook} className="admin-form">
            <input placeholder="Tytuł" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input placeholder="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            <input type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} />
            <button type="submit">Dodaj</button>
          </form>
        </section>

        {/*  Katalog książek */}
        <section className="books-section">
          <h2>Katalog książek</h2>
          {books.map(book => (
            <div key={book.id} className="book-card">
              <strong>{book.title}</strong> – {book.author}  
              <p>Egzemplarze: {book.availableCopies}</p>
              <div>
                <button className="edit" onClick={() => editBook(book.id)}>Edytuj</button>
                <button className="delete" onClick={() => deleteBook(book.id)}>Usuń</button>
              </div>
            </div>
          ))}
        </section>

        {/*  Zarządzanie użytkownikami */}
        <section className="users-section">
          <h2>Użytkownicy</h2>
          {users.map(u => (
            <div key={u.id} className="user-card">
              <strong>{u.name} – {u.email}</strong> ({u.role || "user"}) 
              {u.blocked && <span style={{color:"red", marginLeft:"0.5rem"}}>Zablokowany</span>}
              <div>
                <button className="block" onClick={() => toggleBlockUser(u.id)}>
                    {u.blocked ? "Odblokuj" : "Zablokuj"}
                </button>
                <button className="reset" onClick={() => resetPassword(u.id)}>Resetuj hasło</button>
              </div>
            </div>
          ))}
        </section>

        {/*  Wypożyczenia */}
        <section className="rentals-section">
          <h2>Wypożyczenia</h2>
          <ul>
            {rentals.map(r => (
              <li key={r.id}>
                Użytkownik ID: {r.userId} | Książka ID: {r.bookId} | Termin: {new Date(r.dueDate).toLocaleDateString()}
                {new Date(r.dueDate) < new Date() && <span style={{color:"red"}}> (przeterminowane)</span>}
              </li>
            ))}
          </ul>
        </section>

        {/*  Raporty */}
        <section className="reports-section">
          <h2>Statystyki wypożyczeń</h2>
          <ul>
            {rentalStats.map(b => (
              <li key={b.title}>{b.title}: {b.rentals} wypożyczeń</li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
