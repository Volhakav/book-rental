import { useState } from "react";

export default function LogInPage(){
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    return(
        <div>
            <h1>Witaj nanasze stronie wypożyczlni książek! Zaloguj się aby rozpocząć</h1>
            <div>
                <lable htmlFor="email">Email:</lable>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <lable htmlFor="password">Hasło:</lable>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button>Zaloguj się</button>
        </div>
    )
}