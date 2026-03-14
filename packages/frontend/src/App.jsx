import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import FilmDetailPage from "./pages/FilmDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MediaDetail from "./pages/MediaDetail/MediaDetail.jsx";

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

function App() {
  const navigate = useNavigate();
  const INVALID_TOKEN = "INVALID_TOKEN";
  const [token, setToken] = useState(INVALID_TOKEN);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  function addAuthHeader(otherHeaders = {}) {
    if (token === INVALID_TOKEN) {
      return otherHeaders;
    } else {
      return {
        ...otherHeaders,
        Authorization: `Bearer ${token}`
      };
    }
  }

  function loginUser(creds) {
    const promise = fetch(`${API_PREFIX}/login`, {
      method: "POST",
      headers: addAuthHeader({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(creds)
    })
      .then((response) => {
        if (response.status === 200) {
          response
            .json().then((payload) => {setToken(payload.token); navigate("/");});
          setMessage(`Login successful; auth token saved`);
        } else {
          setMessage(
            `Login Error ${response.status}: ${response.data}`
          );
        }
      })
      .catch((error) => {
        setMessage(`Login Error: ${error}`);
      });

    return promise;
  }

  function signupUser(creds) {
  const promise = fetch(`${API_PREFIX}/signup`, {
    method: "POST",
    headers: addAuthHeader({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(creds)
  })
    .then((response) => {
      if (response.status === 201) {
        response
          .json()
          .then((payload) => {
            setToken(payload.token);
            localStorage.setItem("token", payload.token);
            navigate("/");
          });
        setMessage(
          `Signup successful for user: ${creds.username}; auth token saved`
        );
      } else {
        setMessage(
          `Signup Error ${response.status}: ${response.data}`
        );
      }
    })
    .catch((error) => {
      setMessage(`Signup Error: ${error}`);
    });

  return promise;
}

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
        <Route path="/login" element={<LoginPage handleSubmit={loginUser} />} />
        <Route path="/signup" element={<LoginPage handleSubmit={signupUser} buttonLabel="Sign Up" modalLabel="Sign Up"/>} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route
          path="/media/:mediaType/:id"
          element={<MediaDetail />}
        />
      </Routes>
    </div>
  );
}

export default App;
