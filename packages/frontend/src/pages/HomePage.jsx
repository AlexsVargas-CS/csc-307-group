import SearchBar from "../components/SearchBar.jsx";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center px-4 pt-32">
      <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-amber-400">
        Showme
      </h1>
      <p className="mb-8 text-lg text-gray-400">
        Discover films and TV shows
      </p>
      <SearchBar />
    </main>
  );
}
