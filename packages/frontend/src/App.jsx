import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DevToolsProvider } from "./context/DevToolsContext.jsx";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import FilmDetailPage from "./pages/FilmDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MediaDetail from "./pages/MediaDetail/MediaDetail.jsx";
import DevTools from "./components/DevTools/DevTools.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import LogPage from "./pages/LogPage.jsx";

function App() {
  return (
    <AuthProvider>
      <DevToolsProvider>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        {import.meta.env.DEV && <DevTools />}
        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />
          <Route
            path="/search"
            element={<SearchResultsPage />}
          />
          <Route
            path="/film/:type/:tmdbId"
            element={<FilmDetailPage />}
          />
          <Route
            path="/login"
            element={
              <LoginPage mode="login" />
            }
          />
          <Route
            path="/signup"
            element={
              <LoginPage mode="signup" />
            }
          />
          <Route
            path="/profile/:username"
            element={<ProfilePage />}
          />
          <Route
            path="/profile/:username/watchlist"
            element={<Watchlist />}
          />
          <Route
            path="/profile/:username/logs"
            element={<LogPage />}
          />
          <Route
            path="/media/:mediaType/:id"
            element={<MediaDetail />}
          />
        </Routes>
      </div>
      </DevToolsProvider>
    </AuthProvider>
  );
}

export default App;
