import { Link } from "react-router-dom";

export default function UserCard({ user }) {
  const API_PREFIX =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

  return (
    <Link
      to={`/profile/${user.username}`}
      className="group flex items-center gap-4 rounded-lg bg-gray-800 p-4 shadow transition hover:shadow-xl hover:ring-1 hover:ring-amber-400/50"
    >
      {user.profilePictureUrl ? (
        <img
          src={`${API_PREFIX}${user.profilePictureUrl}`}
          alt={user.username}
          className="h-12 w-12 rounded-full border border-gray-700 object-cover transition group-hover:border-amber-400"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-lg font-bold text-gray-300 transition group-hover:bg-gray-600">
          {user.username[0].toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {user.username}
        </p>
        {user.bio && (
          <p className="mt-0.5 truncate text-xs text-gray-400">
            {user.bio}
          </p>
        )}
      </div>
    </Link>
  );
}
