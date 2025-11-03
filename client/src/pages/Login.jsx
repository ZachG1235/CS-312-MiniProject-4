import React, { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        // prevent page reload
        e.preventDefault(); 
        try
        {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok)
            {
                throw new Error("Login failed");
            }

            const data = await res.json();
            setMessage("Login successful!");
            console.log(data);
        } 
        catch (err) 
        {
            setMessage("Invalid credentials or server error.");
        }
    };

    return (
    <div className="container my-5 d-flex justify-content-center">
        <div className="card text-center card-body" style={{ maxWidth: "600px", width: "100%" }}>
            <div className="card-title">
                <h1>Login to your Account</h1>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="form-group py-3">
                        <label htmlFor="email">Email</label>
                        <input type="email" className="form-control" placeholder="name@email" name="email"
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group py-3">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" placeholder="*****" name="password"
                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                {message && <p className="mt-3">{message}</p>}
            </div>
        </div>
    </div>
  );
}