import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "./img/full_logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const [user, setUser] = useState(loggedUser);
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: loggedUser?.name || "",
    surname: loggedUser?.surname || "",
    email: loggedUser?.email || "",
  });

  /* =========================
     SYNCHRONIZACJA Z SYSTEMEM
  ========================= */
  useEffect(() => {
    setBooks(JSON.parse(localStorage.getItem("books")) || []);
    setRentals(JSON.parse(localStorage.getItem("rentals")) || []);
  }, []);

  if (!user || user.blocked) {
    return <h2 className="no-access">Konto zablokowane lub brak dostępu</h2>;
  }

  /* =========================
     FUNKCJE PROFILU
  ========================= */
  const saveUser = (updatedUser) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const changePassword = () => {
    const newPass = prompt("Podaj nowe hasło:");
    if (!newPass) return;
    saveUser({ ...user, password: newPass });
  };

  const toggleNotifications = () => {
    saveUser({
      ...user,
      preferences: {
        ...user.preferences,
        notifications: !user.preferences.notifications,
      },
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = () => {
    if (!profileForm.name || !profileForm.surname || !profileForm.email) {
      alert("Imię, nazwisko i email są wymagane");
      return;
    }

    if (!profileForm.email.includes("@")) {
      alert("Niepoprawny email");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const emailTaken = users.some(
      (u) => u.email === profileForm.email && u.id !== user.id
    );
    if (emailTaken) {
      alert("Email jest już używany przez innego użytkownika");
      return;
    }

    const updatedUser = {
      ...user,
      name: profileForm.name,
      surname: profileForm.surname,
      email: profileForm.email,
    };

    saveUser(updatedUser);
    setEditProfile(false);
  };

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  /* =========================
     WYPOŻYCZENIA
  ========================= */
  const rentBook = (bookId) => {
    const book = books.find((b) => b.id === bookId);
    if (!book || book.availableCopies === 0) return;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newRental = {
      id: Date.now(),
      userId: user.id,
      bookId,
      rentDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
    };

    const updatedRentals = [...rentals, newRental];
    localStorage.setItem("rentals", JSON.stringify(updatedRentals));
    setRentals(updatedRentals);

    const updatedBooks = books.map((b) =>
      b.id === bookId
        ? { ...b, availableCopies: b.availableCopies - 1 }
        : b
    );

    localStorage.setItem("books", JSON.stringify(updatedBooks));
    setBooks(updatedBooks);
  };

  const myRentals = rentals.filter((r) => r.userId === user.id);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================
     JSX
  ========================= */
  return (
    <div className="dashboard-page">
      <header className="header">
        <img src={fullLogo} alt="Logo" className="logo" />
      </header>

      <div className="dashboard">
        {/* GÓRA */}
        <div className="dashboard-top">
          <h1>Panel użytkownika</h1>
          <button onClick={logout} className="loginBtn">Wyloguj</button>
        </div>

        {/* PROFIL */}
        <section className="profile-section">
          <h2>Profil użytkownika</h2>

          {!editProfile ? (
            <>
              <p><strong>Imię:</strong> {user.name}</p>
              <p><strong>Nazwisko:</strong> {user.surname}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p>
                <strong>Powiadomienia:</strong>{" "}
                {user.preferences.notifications ? "Włączone" : "Wyłączone"}
              </p>

              <div className="profile-actions">
                <button onClick={() => setEditProfile(true)}>Edytuj profil</button>
                <button onClick={toggleNotifications}>Zmień powiadomienia</button>
                <button onClick={changePassword}>Zmień hasło</button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-form">
                <label>
                  Imię
                  <input
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                  />
                </label>

                <label>
                  Nazwisko
                  <input
                    name="surname"
                    value={profileForm.surname}
                    onChange={handleProfileChange}
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                  />
                </label>
              </div>

              <div className="profile-actions">
                <button onClick={saveProfile}>Zapisz</button>
                <button className="danger" onClick={() => setEditProfile(false)}>Anuluj</button>
              </div>
            </>
          )}
        </section>

        {/* KATALOG KSIĄŻEK */}
        <section className="books-section">
          <h2>Katalog książek</h2>

          <input
            className="search"
            placeholder="Szukaj książki..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredBooks.length === 0 && <p className="empty">Brak dostępnych książek</p>}

          {filteredBooks.map((book) => {
            const alreadyRented = myRentals.some(r => r.bookId === book.id);
            return (
              <div key={book.id} className="book-card">
                <strong>{book.title}</strong> – {book.author}
                <p>Dostępność: {book.availableCopies}</p>

                {book.availableCopies > 0 && !alreadyRented ? (
                  <button onClick={() => rentBook(book.id)}>Wypożycz</button>
                ) : alreadyRented ? (
                  <span>📌 Już wypożyczona</span>
                ) : (
                  <span>❌ Brak egzemplarzy</span>
                )}
              </div>
            );
          })}
        </section>

        {/* HISTORIA WYPOŻYCZEŃ */}
        <section className="history-section">
          <h2>Historia wypożyczeń</h2>

          {myRentals.length === 0 ? (
            <p className="empty">Brak wypożyczeń</p>
          ) : (
            myRentals.map((r) => {
              const book = books.find((b) => b.id === r.bookId);
              const late = new Date(r.dueDate) < new Date();
              return (
                <div key={r.id} className="rental-item">
                  📖 <strong>{book?.title || "Usunięta książka"}</strong><br/>
                  ⏰ Termin zwrotu: {new Date(r.dueDate).toLocaleDateString()}
                  {late && <span className="late"> ⚠️ Po terminie</span>}
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
