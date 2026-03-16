import { useState } from "react";
import Modal from "../Modal/Modal.jsx";
import StarRating from "../StarRating/StarRating.jsx";
import { DIMENSION_LABELS } from "../../data/mockMediaData.js";

const DIMENSIONS = Object.keys(DIMENSION_LABELS);

/**
 * Rating / review submission modal.
 *
 * Props:
 *  - isOpen    : boolean
 *  - onClose   : () => void
 *  - mediaId   : string
 *  - mediaType : string
 */
export default function LogModal({
  isOpen,
  onClose,
  mediaId,
  mediaType,
}) {
  const today = new Date().toISOString().split("T")[0];
  const [watchedDate, setWatchedDate] = useState(today);
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState(
    Object.fromEntries(DIMENSIONS.map((d) => [d, null])),
  );

  function updateRating(dimension, value) {
    setRatings((prev) => ({
      ...prev,
      [dimension]: value === 0 ? null : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const submission = {
      mediaId,
      mediaType,
      watchedDate,
      reviewText,
      ratings,
    };

    console.log("Log submission:", submission);
    onClose();

    // Reset form
    setWatchedDate(today);
    setReviewText("");
    setRatings(
      Object.fromEntries(DIMENSIONS.map((d) => [d, null])),
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-6 text-xl font-bold text-white">
        Log & Rate
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">
            Date Watched
          </label>
          <input
            type="date"
            value={watchedDate}
            onChange={(e) => setWatchedDate(e.target.value)}
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
            onChange={(e) => setReviewText(e.target.value)}
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
                  onChange={(val) => updateRating(dim, val)}
                  mode="interactive"
                  size="text-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-amber-400 py-2.5 font-semibold text-black transition-colors hover:bg-amber-500"
        >
          Submit Rating
        </button>
      </form>
    </Modal>
  );
}
