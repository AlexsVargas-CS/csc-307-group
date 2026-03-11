import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl items-center gap-2">
      <input
        type="text"
        placeholder="Search for a movie or TV show..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-2 focus:ring-amber-400"
      />
      <button
        type="submit"
        className="rounded-lg bg-amber-500 px-5 py-3 font-semibold text-gray-900 transition hover:bg-amber-400">
        Search
      </button>
    </form>
  );
}
