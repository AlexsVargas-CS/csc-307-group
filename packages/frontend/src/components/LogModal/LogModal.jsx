import { useEffect, useState } from "react";
import Modal from "../Modal/Modal.jsx";
import StarRating from "../StarRating/StarRating.jsx";
import { DIMENSION_LABELS } from "../../data/mockMediaData.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  lookupFilm,
  getMyRating,
  submitRating,
} from "../../api/ratings.js";

const DIMENSIONS = Object.keys(DIMENSION_LABELS);

/**
 * Rating / review submission modal.
 *
 * Props:
 *  - isOpen      : boolean
 *  - onClose     : () => void
 *  - mediaId     : string (tmdbId)
 *  - mediaType   : string
 *  - onSubmitted : () => void (optional callback after successful submit)
 */
export default function LogModal({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  onSubmitted,
  initialRating = null,
}) {
  const { token, isAuthenticated } = useAuth();
  const today = new Date()
    .toISOString()
    .split("T")[0];
  const [watchedDate, setWatchedDate] =
    useState(today);
  const [reviewText, setReviewText] =
    useState("");
  const [overallScore, setOverallScore] =
    useState(0);
  const [ratings, setRatings] = useState(
    Object.fromEntries(
      DIMENSIONS.map((d) => [d, null])
    ),
  );
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState(null);

  function updateRating(dimension, value) {
    setRatings((prev) => ({
      ...prev,
      [dimension]: value === 0 ? null : value,
    }));
  }

  function resetForm() {
    setWatchedDate(today);
    setReviewText("");
    setOverallScore(0);
    setRatings(
      Object.fromEntries(
        DIMENSIONS.map((d) => [d, null])
      ),
    );
    setError(null);
  }

  useEffect(() => {
    if (!isOpen) return;

    async function loadExistingRating() {
      if (!isAuthenticated || !token) {
        resetForm();
        return;
      }

      const existing =
        initialRating ||
        (await (async () => {
          const film = await lookupFilm(
            mediaId,
            mediaType
          );
          if (!film) return null;
          return getMyRating(film._id, token);
        })());

      if (!existing) {
        resetForm();
        return;
      }

      setReviewText(existing.reviewText || "");
      setOverallScore(existing.score || 0);
      setRatings(
        Object.fromEntries(
          DIMENSIONS.map((dimension) => {
            const found = (
              existing.categoryRatings || []
            ).find(
              (item) => item.category === dimension,
            );
            return [
              dimension,
              found ? found.score : null,
            ];
          }),
        ),
      );
      setError(null);
    }

    loadExistingRating();
  }, [
    initialRating,
    isAuthenticated,
    isOpen,
    mediaId,
    mediaType,
    token,
  ]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError("Please log in to rate.");
      return;
    }

    // Round to nearest integer for backend
    const score = Math.round(overallScore);
    if (score < 1 || score > 5) {
      setError(
        "Please select an overall rating (1-5 stars)."
      );
      return;
    }

    setSubmitting(true);
    try {
      // Look up the Film's MongoDB _id
      const film = await lookupFilm(
        mediaId,
        mediaType
      );
      if (!film) {
        setError(
          "Film not found. Try refreshing."
        );
        return;
      }

      // Build category ratings (only non-null)
      const categoryRatings = DIMENSIONS.filter(
        (d) => ratings[d] != null
      ).map((d) => ({
        category: d,
        score: Math.round(ratings[d]),
      }));

      await submitRating(
        film._id,
        { score, categoryRatings, reviewText },
        token
      );

      resetForm();
      onClose();
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(
        err.message || "Failed to submit rating."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-6 text-xl font-bold text-white">
        Rate
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Overall rating */}
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Overall Rating *
          </label>
          <StarRating
            value={overallScore}
            onChange={setOverallScore}
            mode="interactive"
            size="text-2xl"
          />
        </div>

        {/* Date */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">
            Date Watched
          </label>
          <input
            type="date"
            value={watchedDate}
            onChange={(e) =>
              setWatchedDate(e.target.value)
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Review text */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">
            Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) =>
              setReviewText(e.target.value)
            }
            placeholder="What did you think?"
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Dimensional ratings — 3×2 grid */}
        <div>
          <label className="mb-3 block text-sm text-gray-400">
            Rate each dimension (optional)
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIMENSIONS.map((dim) => (
              <div key={dim}>
                <span className="mb-1 block text-xs font-medium text-gray-300">
                  {DIMENSION_LABELS[dim]}
                </span>
                <StarRating
                  value={ratings[dim] ?? 0}
                  onChange={(val) =>
                    updateRating(dim, val)
                  }
                  mode="interactive"
                  size="text-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-amber-400 py-2.5 font-semibold text-black transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : initialRating
              ? "Save Changes"
              : "Submit Rating"}
        </button>
      </form>
    </Modal>
  );
}
