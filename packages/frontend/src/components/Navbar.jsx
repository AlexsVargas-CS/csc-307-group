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
  const [username, setUsername] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const API_PREFIX =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

  function handleProfileClick() {
    if (username) {
      navigate(`/profile/${username}`);
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
    const usernameFromToken = getUsernameFromToken();
    setUsername(usernameFromToken);

    if (!usernameFromToken) {
      setProfilePictureUrl(null);
      return;
    }

    async function loadProfilePicture() {
      try {
        const res = await fetch(`${API_PREFIX}/api/users/${usernameFromToken}`);
        if (!res.ok) {
          setProfilePictureUrl(null);
          return;
        }

        const data = await res.json();
        setProfilePictureUrl(data.profilePictureUrl || null);
      } catch {
        setProfilePictureUrl(null);
      }
    }

    loadProfilePicture();

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
  }, [API_PREFIX]);
      

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
        <Link
          to="/"
          className="text-xl font-bold italic tracking-wide text-amber-400"
        >
          Showme
        </Link>

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

        <button
          onClick={handleProfileClick}
          className="flex items-center justify-center transition"
          title={username ? "Your profile" : "Login"}
        >
          {username ? (
            profilePictureUrl ? (
              <img
                src={`${API_PREFIX}${profilePictureUrl}`}
                alt="Profile"
                className="h-9 w-9 rounded-full border border-gray-700 object-cover transition hover:border-amber-400"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-300 hover:bg-gray-700">
                {username[0].toUpperCase()}
              </div>
            )
          ) : (
            <span className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-amber-400">
              Login
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
