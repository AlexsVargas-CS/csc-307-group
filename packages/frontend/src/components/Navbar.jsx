import { useState, useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const API_PREFIX =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";

  function resolveImageUrl(path) {
    if (!path) return null;
    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }
    return `${API_PREFIX}${path}`;
  }

  function handleProfileClick() {
    if (username) {
      navigate(`/profile/${username}`);
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
    async function syncProfilePicture() {
      const usernameFromToken = getUsernameFromToken();
      setUsername(usernameFromToken);

      if (!usernameFromToken) {
        setProfilePictureUrl(null);
        return;
      }

      try {
        const res = await fetch(
          `${API_PREFIX}/api/users/${usernameFromToken}`,
        );
        if (!res.ok) {
          setProfilePictureUrl(null);
          return;
        }

        const data = await res.json();
        setProfilePictureUrl(
          data.profilePictureUrl || null,
        );
      } catch {
        setProfilePictureUrl(null);
      }
    }

    syncProfilePicture();
    window.addEventListener(
      "profile-updated",
      syncProfilePicture,
    );

    return () => {
      window.removeEventListener(
        "profile-updated",
        syncProfilePicture,
      );
    };
  }, [API_PREFIX, location.pathname]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    setQuery("");
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/90 px-6 py-3 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold tracking-wide text-amber-400"
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
            onChange={(e) => setQuery(e.target.value)}
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
                src={resolveImageUrl(profilePictureUrl)}
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
