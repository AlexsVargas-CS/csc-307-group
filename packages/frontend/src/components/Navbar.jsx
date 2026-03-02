import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    setQuery("");
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center gap-4 bg-gray-900/90 px-6 py-3 shadow-lg backdrop-blur">
      <Link
        to="/"
        className="text-xl font-bold tracking-wide text-amber-400">
        Showme
      </Link>

      <form
        onSubmit={handleSubmit}
        className="ml-auto flex max-w-sm flex-1 items-center">
        <input
          type="text"
          placeholder="Search films..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-amber-400"
        />
      </form>
    </nav>
  );
}
