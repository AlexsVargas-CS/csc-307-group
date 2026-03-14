import { useState, useRef, useEffect } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } =
    useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener(
      "mousedown",
      handleClickOutside
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(
      `/search?query=${encodeURIComponent(trimmed)}`
    );
    setQuery("");
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/90 px-6 py-3 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        {/* Left - Logo */}
        <Link
          to="/"
          className="text-xl font-bold italic tracking-wide text-amber-400"
        >
          Showme
        </Link>

        {/* Center - Search */}
        <form
          onSubmit={handleSubmit}
          className="mx-8 flex w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Search films..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="w-full rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-amber-400"
          />
        </form>

        {/* Right - Auth */}
        {isAuthenticated ? (
          <div
            ref={menuRef}
            className="relative"
          >
            <button
              onClick={() =>
                setMenuOpen((p) => !p)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-gray-950 transition hover:bg-amber-400"
            >
              {user.username
                .charAt(0)
                .toUpperCase()}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 py-1 shadow-xl ring-1 ring-gray-700">
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  My Profile
                </Link>
                <Link
                  to="#"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Watchlist
                </Link>
                <Link
                  to="#"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Settings
                </Link>
                <hr className="my-1 border-gray-700" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-300 transition hover:text-white"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-400"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
