import React, { useState } from "react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayname, setDisplayName] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        // prevent page reload
        e.preventDefault(); 
        try
        {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, displayname }),
            });

            if (!res.ok)
            {
                throw new Error("Register failed");
            }

            const data = await res.json();
            setMessage("Registration successful!");
            console.log(data);
        } 
        catch (err) 
        {
            setMessage("Invalid credentials or server error.");
        }
    };

    return (
    <div class="card text-center card-body cust-max-screen-width-1000">
        <div class="card-title">
            <h1>Register your Account</h1>
        </div>
        <div class="card-body">
            <form onSubmit={handleSubmit}>
                <div class="form-group py-3">
                    <label for="email">Email</label>
                    <input type="email" class="form-control" placeholder="name@email" name="email"
                     value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div class="form-group py-3">
                    <label for="password">Password</label>
                    <input type="password" class="form-control" placeholder="*****" name="password"
                     value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div class="form-group py-3">
                    <label for="displayname">Display Name</label>
                    <input type="displayname" class="form-control" placeholder="John Doe" name="displayname"
                     value={displayname} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
            </form>
        </div>
    </div>
  );
}




