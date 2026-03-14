import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const user = useMemo(
    () => (token ? decodeToken(token) : null),
    [token]
  );
  const isAuthenticated = !!user;

  useEffect(() => {
    if (token && !user) {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [token, user]);

  const saveToken = useCallback((t) => {
    localStorage.setItem("token", t);
    setToken(t);
  }, []);

  const login = useCallback(
    async (creds) => {
      const res = await fetch(
        `${API_PREFIX}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(creds)
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Login failed");
      }
      const { token: t } = await res.json();
      saveToken(t);
      navigate("/");
    },
    [navigate, saveToken]
  );

  const signup = useCallback(
    async (creds) => {
      const res = await fetch(
        `${API_PREFIX}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(creds)
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Signup failed");
      }
      const { token: t } = await res.json();
      saveToken(t);
      navigate("/");
    },
    [navigate, saveToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  }, [navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      signup,
      logout
    }),
    [
      token,
      user,
      isAuthenticated,
      login,
      signup,
      logout
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }
  return ctx;
}
