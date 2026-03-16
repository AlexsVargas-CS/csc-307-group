import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage({
  mode = "login"
}) {
  const { login, signup } = useAuth();
  const isSignup = mode === "signup";

  const [creds, setCreds] = useState({
    username: "",
    pwd: ""
  });
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setCreds((prev) => ({
      ...prev,
      [name === "password" ? "pwd" : name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        if (creds.pwd !== confirmPwd) {
          setError("Passwords do not match");
          return;
        }
        await signup(creds);
      } else {
        await login(creds);
      }

      // Only reload after successful login/signup
      window.location.reload();
    } catch (err) {
      setError(err.message);
      if (!isSignup) {
        setCreds((prev) => ({ ...prev, pwd: "" }));
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <form
        onSubmit={handleSubmit}
        className="w-80 rounded-2xl bg-gray-900 p-8 shadow-lg border border-gray-800"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          {isSignup ? "Sign Up" : "Log In"}
        </h2>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={creds.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={creds.pwd}
          onChange={handleChange}
          required
        />

        {isSignup && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full mb-6 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            required
          />
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300 transition"
        >
          {isSignup ? "Sign Up" : "Log In"}
        </button>

        {!isSignup && (
          <p className="mt-4 text-center text-sm text-gray-400">
            New user?{" "}
            <Link to="/signup" className="text-amber-400 hover:underline">
              Sign up here
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
