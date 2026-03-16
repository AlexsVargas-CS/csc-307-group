import { useState } from "react";
import StarRating from "../StarRating/StarRating.jsx";

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

function resolveImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_PREFIX}${path}`;
}

export default function ReviewCard({ review }) {
  const [liked, setLiked] = useState(
    review.isLikedByCurrentUser,
  );
  const [likes, setLikes] = useState(review.likeCount);
  const [expanded, setExpanded] = useState(false);

  function toggleLike() {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  }

  const date = new Date(review.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  const avatarSrc = resolveImageUrl(review.avatarUrl);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1e1e1e] p-4">
      <div className="flex items-center gap-3">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={`${review.username} avatar`}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-sm font-semibold text-gray-300">
            {review.username?.[0]?.toUpperCase() || "?"}
          </div>
        )}

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
      </div>

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

      <div className="mt-3">
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