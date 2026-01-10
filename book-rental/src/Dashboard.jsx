import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "./img/full_logo.png";

export default function Dashboard() {
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const [user, setUser] = useState(() => {
        if (!storedUser) return null;
        return {
            id: storedUser.id,
            name: storedUser.name || "Użytkownik",
            surname: storedUser.surname || "",
            email: storedUser.email || storedUser.login || "",
            role: storedUser.role || storedUser.rola || "user",
            blocked: storedUser.blocked ?? false,
            preferences: storedUser.preferences ?? { notifications: false }
        };
    });

    const [books, setBooks] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [search, setSearch] = useState("");
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        surname: user?.surname || "",
        email: user?.email || ""
    });

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch("http://localhost:8082/api/ksiazki");
                const data = await response.json();

                const formattedBooks = data.map(book => ({
                    id: book.id,
                    title: book.tytul,
                    author: book.autor,
                    category: book.kategoria,
                    year: book.rokWydania,
                    availableCopies: book.availableCopies
                }));

                setBooks(formattedBooks);
            } catch (error) {
                console.error("Błąd pobierania książek:", error);
                setBooks(JSON.parse(localStorage.getItem("books")) || []);
            }
        };

        fetchBooks();
        setRentals(JSON.parse(localStorage.getItem("rentals")) || []);
    }, []);

    if (!user || user.blocked) {
        return <h2 className="no-access">Brak dostępu lub konto zablokowane</h2>;
    }

    const saveProfile = async () => {
        try {
            const res = await fetch(`http://localhost:8082/api/konto/${user.id}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: user.id,
                    login: profileForm.email,
                    name: profileForm.name,
                    surname: profileForm.surname,
                    rola: user.role
                })
            });

            let updatedUser = await res.json();

            updatedUser = {
                ...updatedUser,
                preferences: updatedUser.preferences ?? { notifications: false }
            };

            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditProfile(false);

        } catch (err) {
            alert("Błąd zapisu profilu");
        }
    };

    const toggleNotifications = () => {
        const updatedUser = {
            ...user,
            preferences: {
                ...user.preferences,
                notifications: !user.preferences.notifications
            }
        };
        setUser(updatedUser);
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    };

    const changePassword = () => {
        alert("Funkcja zmiany hasła niezaimplementowana");
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const logout = () => {
        localStorage.removeItem("loggedInUser");
        navigate("/");
    };

    const rentBook = async (bookId) => {
        const book = books.find((b) => b.id === bookId);
        if (!book || book.availableCopies === 0) return;

        try {
            const response = await fetch("http://localhost:8082/api/wypozyczenia", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    kontoId: user.id,
                    ksiazkaId: bookId,
                    pracownikId: 1

                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const newRental = await response.json();

            const updatedRentals = [...rentals, {
                id: newRental.id,
                userId: user.id,
                bookId,
                rentDate: newRental.dataWypozyczenia,
                dueDate: new Date(new Date(newRental.dataWypozyczenia).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()

            }];

            setRentals(updatedRentals);
            localStorage.setItem("rentals", JSON.stringify(updatedRentals));

            const updatedBooks = books.map((b) =>
                b.id === bookId
                    ? { ...b, availableCopies: b.availableCopies - 1 }
                    : b
            );

            setBooks(updatedBooks);
            localStorage.setItem("books", JSON.stringify(updatedBooks));

            alert("Książka wypożyczona pomyślnie!");
        } catch (error) {
            console.error("Błąd wypożyczenia:", error);
            alert("Nie udało się wypożyczyć książki: " + error.message);
        }
    };


    const myRentals = rentals.filter((r) => r.userId === user.id);

    const myRentalsWithAlerts = myRentals.map(r => {
        const book = books.find(b => b.id === r.bookId);
        const today = new Date();
        const dueDate = new Date(r.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let alertMessage = "";
        if (diffDays === 3) alertMessage = "Pozostały 3 dni do zwrotu!";
        if (diffDays === 1) alertMessage = "Ostatni dzień na zwrot książki!";
        if (diffDays < 0) alertMessage = "Książka po terminie!";

        return { ...r, bookTitle: book?.title, alertMessage };
    });

    const filteredBooks = books.filter(
        (b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase())
    );

    const returnBook = async (rentalId, bookId) => {
        try {
            const response = await fetch(`http://localhost:8082/api/wypozyczenia/${rentalId}/zwrot`, {
                method: "PUT",
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            // usuń wypożyczenie z listy lokalnej
            const updatedRentals = rentals.filter(r => r.id !== rentalId);
            setRentals(updatedRentals);
            localStorage.setItem("rentals", JSON.stringify(updatedRentals));

            // zwiększ dostępność książki
            const updatedBooks = books.map(b =>
                b.id === bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
            );
            setBooks(updatedBooks);
            localStorage.setItem("books", JSON.stringify(updatedBooks));

            alert("Książka zwrócona pomyślnie!");
        } catch (error) {
            console.error("Błąd zwrotu:", error);
            alert("Nie udało się zwrócić książki: " + error.message);
        }
    };


    return (
        <div className="dashboard-page">
            <header className="header">
                <img src={fullLogo} alt="Logo" className="logo" />
            </header>

            <div className="dashboard">
                <div className="dashboard-top">
                    <h1>Panel użytkownika</h1>
                    <button onClick={logout} className="loginBtn">Wyloguj</button>
                </div>

                <section className="profile-section">
                    <h2>Profil użytkownika</h2>

                    {!editProfile ? (
                        <>
                            <p><strong>Imię:</strong> {user.name}</p>
                            <p><strong>Nazwisko:</strong> {user.surname}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p>
                                <strong>Powiadomienia:</strong>{" "}
                                {user.preferences?.notifications ? "Włączone" : "Wyłączone"}
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
                                <p>Kategoria: {book.category || "Ogólna"} | Rok wydania: {book.year || "Brak danych"}</p>
                                <p>Dostępność: {book.availableCopies}</p>

                                {book.availableCopies > 0 && !alreadyRented ? (
                                    <button onClick={() => rentBook(book.id)}>Wypożycz</button>
                                ) : alreadyRented ? (
                                    <span>Już wypożyczona</span>
                                ) : (
                                    <span>Brak egzemplarzy</span>
                                )}
                            </div>
                        );
                    })}
                </section>

                <section className="history-section">
                    <h2>Historia wypożyczeń</h2>

                    {myRentalsWithAlerts.length === 0 ? (
                        <p className="empty">Brak wypożyczeń</p>
                    ) : (
                        myRentalsWithAlerts.map((r) => {
                            const late = new Date(r.dueDate) < new Date();
                            return (
                                <div key={r.id} className="rental-item">
                                    <strong>{r.bookTitle || "Usunięta książka"}</strong><br/>
                                    Termin zwrotu: {new Date(r.dueDate).toLocaleDateString()}
                                    {r.alertMessage && <span className="alert">{r.alertMessage}</span>}
                                    <br/>
                                    {/* Przycisk zwrotu */}
                                    <button 
                                        className="returnBtn"
                                        onClick={() => returnBook(r.id, r.bookId)}
                                    >
                                        Zwróć książkę
                                    </button>
                                </div>
                            );
                        })
                    )}
                </section>

            </div>
        </div>
    );
}