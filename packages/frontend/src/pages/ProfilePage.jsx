import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import FavoriteMoviesModal from "../components/FavoriteMoviesModal.jsx";

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_PREFIX}${path}`;
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [watchlistVisibilityLoading, setWatchlistVisibilityLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");

  // pfp
  const [selectedPfpFile, setSelectedPfpFile] = useState(null);
  const [pfpPreviewUrl, setPfpPreviewUrl] = useState("");
  const [uploadingPfp, setUploadingPfp] = useState(false);

  // favorites
  const [favoriteMovieDetails, setFavoriteMovieDetails] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [activeFavoriteSlot, setActiveFavoriteSlot] = useState(null);

  // watchlist
  const [watchlistVisibilityDraft, setWatchlistVisibilityDraft] = useState("public");

  const isOwner = useMemo(() => {
    return me?.username === username;
  }, [me, username]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");
      setIsEditing(false);

      try {
        const profRes = await fetch(`${API_PREFIX}/api/users/${username}`);
        if (!profRes.ok) {
          const txt = await profRes.text();
          throw new Error(`Profile error ${profRes.status}: ${txt}`);
        }
        const prof = await profRes.json();

        setWatchlistVisibilityDraft(prof.watchlistVisibility || "public");

        const token = localStorage.getItem("token");
        let meData = null;
        if (token) {
          const meRes = await fetch(`${API_PREFIX}/api/me`, {
            headers: authHeaders(),
          });
          if (meRes.ok) {
            meData = await meRes.json();
          }
        }

        if (cancelled) return;

        setProfile(prof);
        setMe(meData);

        setBioDraft(prof.bio || "");

        // reset pfp draft state when profile reloads
        setSelectedPfpFile(null);
        setPfpPreviewUrl("");
      } catch (err) {
        if (!cancelled) setMessage(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    return () => {
      if (pfpPreviewUrl) {
        URL.revokeObjectURL(pfpPreviewUrl);
      }
    };
  }, [pfpPreviewUrl]);

  async function saveEdits() {
    setMessage("");
    try {
      const res = await fetch(`${API_PREFIX}/api/users/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          bio: bioDraft,
          watchlistVisibility: watchlistVisibilityDraft,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Save failed ${res.status}: ${txt}`);
      }

      const updated = await res.json();
      setProfile(updated);
      setIsEditing(false);
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err.message);
    }
  }

    useEffect(() => {
    let cancelled = false;

    async function loadFavoriteMovies() {
      const ids = (profile?.favoriteMovies || [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (!ids.length) {
        setFavoriteMovieDetails([]);
        return;
      }

      setFavoritesLoading(true);

      try {
        const movies = await Promise.all(
          ids.map(async (tmdbId) => {
            const res = await fetch(`${API_PREFIX}/api/tmdb/movie/${tmdbId}`);

            if (!res.ok) {
              const txt = await res.text();
              throw new Error(`Favorite movie load failed ${res.status}: ${txt}`);
            }

            const data = await res.json();
            return data.item;
          })
        );

        if (!cancelled) {
          setFavoriteMovieDetails(movies);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err.message);
          setFavoriteMovieDetails([]);
        }
      } finally {
        if (!cancelled) {
          setFavoritesLoading(false);
        }
      }
    }

    loadFavoriteMovies();

    return () => {
      cancelled = true;
    };
  }, [profile?.favoriteMovies]);


  function handlePfpFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setMessage("Image must be smaller than 5MB.");
      return;
    }

    if (pfpPreviewUrl) {
      URL.revokeObjectURL(pfpPreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSelectedPfpFile(file);
    setPfpPreviewUrl(preview);
    setMessage("");
  }

  async function uploadProfilePicture() {
    if (!selectedPfpFile) return;

    setUploadingPfp(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("pfp", selectedPfpFile);

      const res = await fetch(`${API_PREFIX}/api/users/${username}/pfp`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
        },
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`PFP upload failed ${res.status}: ${txt}`);
      }

      const data = await res.json();

      setProfile((prev) => ({
        ...prev,
        profilePictureUrl: data.profilePictureUrl,
      }));

      if (pfpPreviewUrl) {
        URL.revokeObjectURL(pfpPreviewUrl);
      }

      setSelectedPfpFile(null);
      setPfpPreviewUrl("");
      setMessage("Profile picture updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploadingPfp(false);
    }
  }

  function cancelPfpSelection() {
    if (pfpPreviewUrl) {
      URL.revokeObjectURL(pfpPreviewUrl);
    }
    setSelectedPfpFile(null);
    setPfpPreviewUrl("");
  }

  if (loading) {
    return <p className="p-8 text-gray-400">Loading...</p>;
  }

  if (message && !profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-red-300">
          {message}
        </p>
        <Link to="/" className="mt-4 inline-block text-amber-400 hover:underline">
          &larr; Back
        </Link>
      </main>
    );
  }

  async function saveFavoriteMovies(selectedMovies) {
    if (activeFavoriteSlot === null) return;

    const nextFavorites = [...favoriteMovieDetails];
    const chosenMovie = selectedMovies[0];

    if (!chosenMovie) return;

    nextFavorites[activeFavoriteSlot] = chosenMovie;

    const favoriteMoviesPayload = nextFavorites
      .filter(Boolean)
      .map((movie) => Number(movie.tmdbId))
      .filter((id) => Number.isFinite(id));

    const res = await fetch(`${API_PREFIX}/api/users/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ favoriteMovies: favoriteMoviesPayload }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Save favorites failed ${res.status}: ${txt}`);
    }

    const updated = await res.json();

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            favoriteMovies: updated.favoriteMovies || [],
          }
        : prev
    );

    setFavoriteMovieDetails(nextFavorites);
    setFavoritesModalOpen(false);
    setActiveFavoriteSlot(null);
    setMessage("Favorites updated.");
  }

  if (!profile) return null;

  async function toggleWatchlistVisibility() {
    if (!isOwner || watchlistVisibilityLoading) return;

    const nextVisibility =
      (profile.watchlistVisibility || "public") === "public"
        ? "private"
        : "public";

    setWatchlistVisibilityLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_PREFIX}/api/watchlist/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          watchlistVisibility: nextVisibility,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Visibility update failed ${res.status}: ${txt}`);
      }

      const data = await res.json();

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              watchlistVisibility: data.watchlistVisibility || nextVisibility,
            }
          : prev
      );

      setMessage(
        `Your watchlist and logs are now ${data.watchlistVisibility || nextVisibility}.`
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setWatchlistVisibilityLoading(false);
    }
  }

  const displayedPfp =
    pfpPreviewUrl ||
    resolveImageUrl(profile.profilePictureUrl);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="mb-4 inline-block text-sm text-amber-400 hover:underline">
        &larr; Back
      </Link>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="shrink-0">
              {displayedPfp ? (
                <img
                  src={displayedPfp}
                  alt={`${profile.username} profile`}
                  className="h-24 w-24 rounded-full object-cover border border-gray-700 bg-gray-800"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-3xl font-bold text-gray-300">
                  {profile.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                {profile.username}
              </h1>

              {isOwner && (
                <div className="mt-3 flex items-center gap-2">
                  <label className="inline-block cursor-pointer rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition">
                    Change photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePfpFileChange}
                      className="hidden"
                    />
                  </label>

                  {isEditing && (
                    <button
                      onClick={toggleWatchlistVisibility}
                      disabled={watchlistVisibilityLoading}
                      className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition disabled:opacity-60"
                    >
                      {watchlistVisibilityLoading
                        ? "Saving..."
                        : `Visibility: ${profile.watchlistVisibility === "private" ? "Private" : "Public"}`}
                    </button>
                  )}

                  {selectedPfpFile && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={uploadProfilePicture}
                        disabled={uploadingPfp}
                        className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 transition disabled:opacity-60"
                      >
                        {uploadingPfp ? "Uploading..." : "Save photo"}
                      </button>

                      <button
                        onClick={cancelPfpSelection}
                        disabled={uploadingPfp}
                        className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <span className="text-xs text-gray-500">
                        {selectedPfpFile.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isOwner || (profile.watchlistVisibility || "public") === "public") && (
              <Link
                to={`/profile/${profile.username}/watchlist`}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition"
              >
                View Watchlist
              </Link>
            )}

            {isOwner && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditing((v) => !v)}
                  className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 transition"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-white">Bio</h2>
            {!isEditing ? (
              <p className="mt-2 text-gray-300">
                {profile.bio || <span className="text-gray-500">No bio yet.</span>}
              </p>
            ) : (
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                className="mt-2 w-full rounded-lg bg-gray-800 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                rows={4}
                placeholder="Write a short bio..."
              />
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Top 5 Favorites</h2>
            </div>

            {favoritesLoading ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[2/3] animate-pulse rounded-xl bg-gray-800"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => {
                  const movie = favoriteMovieDetails[index];

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!isOwner}
                      onClick={() => {
                        if (!isOwner) return;
                        setActiveFavoriteSlot(index);
                        setFavoritesModalOpen(true);
                      }}
                      className={`group relative overflow-hidden rounded-xl text-left ${
                        isOwner ? "cursor-pointer" : "cursor-default"
                      }`}
                    >

                      {movie?.posterPath ? (
                        <>
                          <img
                            src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                            alt={movie.title}
                            className="aspect-[2/3] w-full rounded-xl object-cover"
                          />
                          {isOwner && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                              <span className="rounded-lg bg-black/70 px-3 py-2 text-sm font-semibold text-white">
                                Change movie
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/60 text-sm text-gray-500">
                          {isOwner ? "Add favorite" : "Empty"}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {isEditing && isOwner && (
            <div className="flex items-center gap-3">
              <button
                onClick={saveEdits}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 transition"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          )}

          {message && (
            <p className="rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm text-gray-300">
              {message}
            </p>
          )}
        </div>
      </div>

      <FavoriteMoviesModal
        isOpen={favoritesModalOpen}
        onClose={() => {
          setFavoritesModalOpen(false);
          setActiveFavoriteSlot(null);
        }}
        onSave={saveFavoriteMovies}
      />
    </main>
  );
}