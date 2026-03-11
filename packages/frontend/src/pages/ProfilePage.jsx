import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilePage() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null); // username
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // edit state
  const [isEditing, setIsEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [genresDraft, setGenresDraft] = useState("");

  const isOwner = useMemo(() => {
    return me?.username && me.username === username;
  }, [me, username]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");
      setIsEditing(false);

      try {
        // public profile
        const profRes = await fetch(`${API_PREFIX}/api/users/${username}`);
        if (!profRes.ok) {
          const txt = await profRes.text();
          throw new Error(`Profile error ${profRes.status}: ${txt}`);
        }
        const prof = await profRes.json();

        const token = localStorage.getItem("token");
        let meData = null;
        if (token) {
          const meRes = await fetch(`${API_PREFIX}/api/me`, {
            headers: authHeaders(),
          });
          if (meRes.ok) {
            meData = await meRes.json();
          } else {
            meData = null;
          }
        }

        if (cancelled) return;

        setProfile(prof);
        setMe(meData);

        setBioDraft(prof.bio || "");
        setGenresDraft((prof.favoriteGenres || []).join(", "));
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

  async function saveEdits() {
    setMessage("");
    try {
      const favoriteGenres = genresDraft
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      const res = await fetch(`${API_PREFIX}/api/users/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ bio: bioDraft, favoriteGenres }),
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

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="mb-4 inline-block text-sm text-amber-400 hover:underline">
        &larr; Back
      </Link>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {profile.username}
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              {isOwner ? "This is your profile." : "Viewing public profile."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <button
                onClick={() => setIsEditing((v) => !v)}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 transition"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            ) : (
              <button
                disabled
                className="cursor-not-allowed rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-500 border border-gray-700"
                title="Only the profile owner can edit"
              >
                Edit (owner only)
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Bio */}
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

          {/* Genres */}
          <section>
            <h2 className="text-lg font-semibold text-white">Favorite genres</h2>

            {!isEditing ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {(profile.favoriteGenres || []).length > 0 ? (
                  profile.favoriteGenres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300"
                    >
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">None listed.</span>
                )}
              </div>
            ) : (
              <input
                value={genresDraft}
                onChange={(e) => setGenresDraft(e.target.value)}
                className="mt-2 w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="e.g. Drama, Sci-Fi, Comedy"
              />
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
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-750 transition"
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
    </main>
  );
}