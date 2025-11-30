import { useState } from "react";
import fullLogo from './img/full_logo.png';

export default function LogInPage(){
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    return(
        
        <div>
            <img src={fullLogo} alt="Logo wypożyczalni" style={{ width: "150px" }} />
            <h2>Witaj na naszejq stronie wypożyczalni książek! Zaloguj się aby rozpocząć</h2>
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