import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import FilmDetailPage from "./pages/FilmDetailPage.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route
          path="/film/:type/:tmdbId"
          element={<FilmDetailPage />}
        />
      </Routes>
    </div>
  );
}

export default App;
