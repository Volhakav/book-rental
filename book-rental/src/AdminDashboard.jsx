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

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [category, setCategory] = useState("Ogólna");
    const [year, setYear] = useState("");
    const [copies, setCopies] = useState(1);

    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(1);

    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        surname: user?.surname || "",
        email: user?.email || "",
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:8082/api/kategoria");
                setCategories(res.data);
                setCategoryId(res.data[0]?.id || 1);
            } catch (err) {
                console.error("Błąd pobierania kategorii:", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get("http://localhost:8082/api/ksiazki");
                setBooks(res.data);
            } catch (err) {
                console.error("Błąd pobierania książek:", err);
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:8082/api/konto");
                setUsers(res.data);
            } catch (err) {
                console.error("Błąd pobierania użytkowników:", err);
            }
        };

        fetchBooks();
        fetchUsers();
        setRentals(JSON.parse(localStorage.getItem("rentals")) || []);
    }, []);


    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get("http://localhost:8082/api/ksiazki");
                setBooks(res.data);
            } catch (err) {
                console.error("Błąd pobierania książek:", err);
                setBooks(JSON.parse(localStorage.getItem("books")) || []);
            }
        };

        fetchBooks();
  
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

            const data = await response.json();

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

    const addBook = async (e) => {
        e.preventDefault();
        try {
            const newBook = {
                tytul: title,
                autor: author,
                rokWydania: Number(year),
                kategoriaId: categoryId,
                availableCopies: Number(copies) // <-- tu określasz ile kopii ma zostać utworzonych
            };

            const response = await axios.post("http://localhost:8082/api/ksiazki", newBook);
            const savedBook = response.data;

            setBooks((prev) => [...prev, savedBook]);
            setTitle("");
            setAuthor("");
            setCategory("Ogólna");
            setYear("");
            setCopies(1);
            alert("Książka dodana pomyślnie!");
        } catch (err) {
            console.error("Błąd dodawania książki:", err);
            alert("Nie udało się dodać książki");
        }
    };


    const deleteBook = async (id) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę książkę?")) return;

        try {
            await axios.delete(`http://localhost:8082/api/ksiazki/${id}`);
            setBooks((prev) => prev.filter(b => b.id !== id));
            alert("Książka usunięta!");
        } catch (err) {
            console.error("Błąd usuwania książki:", err);
            alert("Nie udało się usunąć książki");
        }
    };

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

    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.blocked).length;
    const totalBooks = books.length;
    const totalRentals = rentals.length;

    const categoryStats = books.reduce((acc, book) => {
        const catName = book.kategoria || "Nieznana";
        acc[catName] = (acc[catName] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="dashboard-page">
            <header className="header">
                <img src={fullLogo} alt="Logo" className="logo" />
            </header>

            <div className="admin-dashboard">
                <div className="dashboard-top">
                    <h1>Panel administratora 🛠️</h1>
                    <button onClick={logout} className="loginBtn">Wyloguj</button>
                </div>

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

                <section className="books-section">
                    <h2>Dodaj książkę</h2>
                    <form onSubmit={addBook} className="admin-form">
                        <input placeholder="Tytuł" value={title} onChange={e => setTitle(e.target.value)} required />
                        <input placeholder="Autor" value={author} onChange={e => setAuthor(e.target.value)} required />
                        <input placeholder="Rok wydania" value={year} onChange={e => setYear(e.target.value)} />
                        <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nazwa}</option>
                            ))}
                        </select>
                        <input type="number" min="1" value={copies} onChange={e => setCopies(e.target.value)} />
                        <button type="submit">Dodaj</button>
                    </form>

                    <h2>Katalog książek</h2>
                    {books.map(b => (
                        <div key={b.id} className="book-card">
                            <strong>{b.tytul}</strong> – {b.autor}
                            <p>Kategoria: {b.kategoria} | Rok: {b.rokWydania}</p>
                            <button className="delete" onClick={() => deleteBook(b.id)}>Usuń</button>
                        </div>
                    ))}
                </section>

                <section className="users-section">
                    <h2>Użytkownicy</h2>
                    {users.map(u => (
                        <div key={u.id} className="user-card">
                            <strong>{u.name} {u.surname}</strong> – {u.login}
                            {!u.verified && <span className="warning">Niezweryfikowany</span>}
                            <div>
                                <button onClick={() => toggleBlockUser(u.id)}>{u.blocked ? "Odblokuj" : "Zablokuj"}</button>
                                {!u.verified && <button onClick={() => verifyUser(u.id)}>Zweryfikuj</button>}
                            </div>
                        </div>
                    ))}
                </section>

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