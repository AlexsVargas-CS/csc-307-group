import { useState } from "react";
import StarRating from "../StarRating/StarRating.jsx";

/**
 * A single review card.
 *
 * Props:
 *  - review : { id, username, avatarUrl, overallStarRating, content, likeCount, isLikedByCurrentUser, createdAt }
 */
export default function ReviewCard({
  review,
  onEdit,
  onDelete,
}) {
  const [liked, setLiked] = useState(
    review.isLikedByCurrentUser,
  );
  const [likes, setLikes] = useState(review.likeCount);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleLike() {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  }

  const date = new Date(review.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <div className="rounded-lg bg-[#1e1e1e] p-4 border border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-400">
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>

        <div className="flex-1">
          <span className="font-semibold text-white">
            {review.username}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {date}
          </span>
        </div>

        <StarRating
          value={review.overallStarRating}
          mode="display"
          size="text-base"
        />

        {review.isOwner && (
          <div className="relative">
            <button
              onClick={() =>
                setMenuOpen((open) => !open)
              }
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-800 hover:text-white"
              aria-label="Review options"
            >
              <span className="flex flex-col items-center gap-0.5">
                <span className="h-1 w-1 rounded-full bg-current" />
                <span className="h-1 w-1 rounded-full bg-current" />
                <span className="h-1 w-1 rounded-full bg-current" />
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-10 min-w-28 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.();
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-gray-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.();
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-red-400 transition hover:bg-gray-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review body */}
      <div className="mt-3">
        <p
          className={`text-sm leading-relaxed text-gray-300 ${!expanded ? "line-clamp-4" : ""}`}
        >
          {review.content}
        </p>
        {review.content.length > 200 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-1 text-xs text-amber-400 hover:underline"
          >
            Read more
          </button>
        )}
      </div>

      {/* Like button */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-amber-400"
        >
          <span
            className={
              liked ? "text-red-500" : "text-gray-500"
            }
          >
            {liked ? "♥" : "♡"}
          </span>
          <span className="text-gray-400">
            {likes} {likes === 1 ? "like" : "likes"}
          </span>
        </button>

      </div>
    </div>
  );
}
