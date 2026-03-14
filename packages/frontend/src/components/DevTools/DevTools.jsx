import { useState } from "react";
import {
  useLocation,
  useParams,
} from "react-router-dom";
import { useDevTools } from "../../context/DevToolsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DevTools() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
  const {
    store,
    generateMockData,
    clearMockData,
    clearAllMockData,
  } = useDevTools();

  // Determine if we're on a media detail page
  const mediaMatch = location.pathname.match(
    /^\/media\/(\w+)\/(\d+)/,
  );
  const mediaKey = mediaMatch
    ? `${mediaMatch[1]}_${mediaMatch[2]}`
    : null;
  const hasMockData = mediaKey && store[mediaKey];

  const mockDataCount = Object.keys(store).length;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg transition-transform hover:scale-110 hover:bg-amber-500"
        title="Dev Tools"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-14 right-0 w-80 rounded-lg border border-gray-700 bg-gray-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
            <h3 className="text-sm font-bold text-amber-400">
              Showme Dev Tools
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white"
            >
              x
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {/* ── Mock Data Generator ── */}
            <Section title="Mock Data Generator">
              {mediaKey ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    Current media:{" "}
                    <span className="text-white">
                      {mediaKey}
                    </span>
                  </p>
                  <button
                    onClick={() =>
                      generateMockData(mediaKey)
                    }
                    className="w-full rounded bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-amber-500"
                  >
                    {hasMockData
                      ? "Regenerate Random Data"
                      : "Generate Random Data"}
                  </button>
                  {hasMockData && (
                    <button
                      onClick={() =>
                        clearMockData(mediaKey)
                      }
                      className="w-full rounded border border-gray-600 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-red-400 hover:text-red-400"
                    >
                      Clear This Film's Data
                    </button>
                  )}
                  {hasMockData && (
                    <p className="text-xs text-gray-500">
                      Generated:{" "}
                      {new Date(
                        store[mediaKey].generatedAt,
                      ).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Navigate to a media detail page
                  (/media/:type/:id) to generate mock
                  ratings and reviews.
                </p>
              )}
              {mockDataCount > 0 && (
                <div className="mt-2 border-t border-gray-800 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {mockDataCount} film(s) with mock
                      data
                    </span>
                    <button
                      onClick={clearAllMockData}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </Section>

            {/* ── Route Info ── */}
            <Section title="Route Info">
              <InfoRow
                label="Path"
                value={location.pathname}
              />
              <InfoRow
                label="Search"
                value={location.search || "(none)"}
              />
              {Object.keys(params).length > 0 && (
                <InfoRow
                  label="Params"
                  value={JSON.stringify(params)}
                />
              )}
            </Section>

            {/* ── Auth State ── */}
            <Section title="Auth State">
              <InfoRow
                label="Logged in"
                value={user ? "Yes" : "No"}
              />
              {user && (
                <>
                  <InfoRow
                    label="Username"
                    value={user.username}
                  />
                  <InfoRow
                    label="User ID"
                    value={user.id || user.sub}
                  />
                </>
              )}
              <InfoRow
                label="Token"
                value={
                  localStorage.getItem("token")
                    ? "Present"
                    : "None"
                }
              />
            </Section>

            {/* ── Environment ── */}
            <Section title="Environment">
              <InfoRow label="Mode" value="development" />
              <InfoRow
                label="API"
                value={
                  import.meta.env.VITE_API_URL ||
                  "proxy (/api)"
                }
              />
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-0.5 text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="max-w-[180px] truncate text-right text-gray-200">
        {value}
      </span>
    </div>
  );
}
