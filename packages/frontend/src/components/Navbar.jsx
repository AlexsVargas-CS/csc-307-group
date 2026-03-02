import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function getUsernameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUsername(getUsernameFromToken());
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    setQuery("");
  }

  function handleProfileClick() {
    if (username) {
      navigate(`/profile/${username}`);
    } else {
      navigate("/login");
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/90 px-6 py-3 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        
        {/* Left - Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-wide text-amber-400"
        >
          Showme
        </Link>

        {/* Center - Search */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md mx-8"
        >
          <input
            type="text"
            placeholder="Search films..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-amber-400"
          />
        </form>

        {/* Right - Profile Button */}
        <button
          onClick={handleProfileClick}
          className="flex items-center justify-center rounded-full bg-gray-800 p-2 text-gray-300 hover:bg-gray-700 hover:text-white transition"
          title={username ? "Your profile" : "Login"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
          </svg>
        </button>
      </div>
    </nav>
  );
}