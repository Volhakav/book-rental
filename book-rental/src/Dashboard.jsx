import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { books as initialBooks } from "./books";
import fullLogo from "./img/full_logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");

  const [rentals, setRentals] = useState(
    JSON.parse(localStorage.getItem("rentals")) || []
  );

  if (!user) {
    return <h2>Brak dostępu</h2>;
  }

  /* 🔍 WYSZUKIWANIE */
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  /* 📖 WYPOŻYCZENIE */
  const rentBook = (bookId) => {
    const alreadyRented = rentals.some(
      (r) => r.userId === user.id && r.bookId === bookId
    );

    if (alreadyRented) return;

    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId && book.availableCopies > 0
          ? { ...book, availableCopies: book.availableCopies - 1 }
          : book
      )
    );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newRental = {
      id: Date.now(),
      userId: user.id,
      bookId,
      rentDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
    };

    setRentals((prev) => {
      const updated = [...prev, newRental];
      localStorage.setItem("rentals", JSON.stringify(updated));
      return updated;
    });
  };

  /* 🔁 ZWROT */
  const returnBook = (rentalId, bookId) => {
    setRentals((prev) => {
      const updated = prev.filter((r) => r.id !== rentalId);
      localStorage.setItem("rentals", JSON.stringify(updated));
      return updated;
    });

    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? { ...book, availableCopies: book.availableCopies + 1 }
          : book
      )
    );
  };

  /* 📜 HISTORIA */
  const myRentals = rentals.filter((r) => r.userId === user.id);

  /* 🚪 WYLOGOWANIE */
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  return (
    <div>
      <header className="header">
        <img src={fullLogo} alt="Logo wypożyczalni" className="logo" />
      </header>

      <div className="dashboard">
        <div className="dashboard-top">
          <h1>Witaj {user.name} 👋</h1>
          <button onClick={logout} className="loginBtn">
            Wyloguj
          </button>
        </div>

        <input
          type="text"
          placeholder="Szukaj książki..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search"
        />

        {/* 📚 KATALOG */}
        <section>
          <h2>Dostępne książki</h2>

          {filteredBooks.map((book) => {
            const alreadyRented = rentals.some(
              (r) => r.userId === user.id && r.bookId === book.id
            );

            return (
              <div key={book.id} className="book-card">
                <strong>{book.title}</strong> – {book.author}
                <p>Dostępne egzemplarze: {book.availableCopies}</p>

                {book.availableCopies > 0 && !alreadyRented ? (
                  <button onClick={() => rentBook(book.id)}>
                    Wypożycz
                  </button>
                ) : alreadyRented ? (
                  <span>📌 Już wypożyczona</span>
                ) : (
                  <span>❌ Brak egzemplarzy</span>
                )}
              </div>
            );
          })}
        </section>

        {/* 📜 HISTORIA */}
        <section>
          <h2>Moje wypożyczenia</h2>
          <p>📚 Liczba wypożyczeń: {myRentals.length}</p>

          {myRentals.length === 0 && <p>Brak wypożyczeń</p>}

          <ul>
            {myRentals.map((rental) => {
              const book = books.find((b) => b.id === rental.bookId);
              const isLate =
                new Date(rental.dueDate) < new Date();

              return (
                <li key={rental.id} className="rental-item">
                  <strong>{book?.title}</strong>
                  <br />
                  📅 Wypożyczono:{" "}
                  {new Date(rental.rentDate).toLocaleDateString()}
                  <br />
                  ⏰ Termin zwrotu:{" "}
                  {new Date(rental.dueDate).toLocaleDateString()}
                  <br />

                  {isLate && (
                    <span className="late">⚠️ Po terminie!</span>
                  )}
                  <br />

                  <button
                    onClick={() =>
                      returnBook(rental.id, rental.bookId)
                    }
                    className="loginBtn"
                  >
                    Zwróć książkę
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
