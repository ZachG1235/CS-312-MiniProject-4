import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar({ children }) {
  const { user_logged_in, user, loading } = useAuth();
  return (
    <>
      <header className="p-3 bg-dark text-white">My App Header</header>
      <nav class="navbar navbar-dark bg-dark">
        <a href="/" class="navbar-brand px-4">BlogDB</a>

        <div class="nav-item dropdown dropstart text-white">
            <a class="nav-link dropdown-toggle mx-3" role="button" data-bs-toggle="dropdown"> 
                {user_logged_in ? (
                  <>
                    {user?.name || "err"}
                    </>
                ) : ( 
                  <>
                  Sign In
                  </>
                )}</a>
            <ul class="dropdown-menu">
              {user_logged_in ? (
                <>
                    <li><a class="dropdown-item text-center" href="/account">Account</a></li>
                    <li><a class="dropdown-item text-center" href="/logout">Logout</a></li>
                </>
              ) : (
                <>
                    <li><a class="dropdown-item text-center" href="/login">Login</a></li>
                    <li><a class="dropdown-item text-center" href="/register">Register</a></li>
                </>
              )}
            </ul>
        </div>
    </nav>
      <main>{children}</main>
      <footer className="p-3 bg-light">© 2025 My App</footer>
    </>
  );
}