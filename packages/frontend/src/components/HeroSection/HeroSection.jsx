import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <section className="px-6 pt-10 pb-4">
        <h2 className="text-2xl font-semibold text-white">
          Welcome back,{" "}
          <span className="text-amber-400">
            {user.username}
          </span>
        </h2>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center px-6 pt-16 pb-10 text-center">
      <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-amber-400">
        Showme
      </h1>
      <p className="mb-6 text-lg text-gray-400">
        Discover films and TV shows
      </p>
      <div className="flex gap-4">
        <Link
          to="/signup"
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-gray-950 transition hover:bg-amber-400"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-gray-600 px-6 py-2.5 font-semibold text-gray-300 transition hover:border-gray-400 hover:text-white"
        >
          Sign In
        </Link>
      </div>
    </section>
  );
}
