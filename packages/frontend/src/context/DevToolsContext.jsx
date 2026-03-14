import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { DIMENSION_LABELS } from "../data/mockMediaData.js";

const DevToolsContext = createContext(null);

const STORAGE_KEY = "showme_devtools_mock";

const USERNAMES = [
  "cinephile_jane",
  "movie_buff_42",
  "filmfanatic99",
  "casual_viewer",
  "directors_cut",
  "reel_talk",
  "screen_sage",
  "popcorn_critic",
  "frame_by_frame",
  "the_projectionist",
];

const REVIEW_TEMPLATES = [
  "Absolutely loved the {dim}. Every scene felt intentional and well-crafted. The director really outdid themselves here.",
  "Decent overall but the {dim} could have been stronger. Still worth a watch for fans of the genre.",
  "A masterpiece. The {dim} alone makes this worth watching multiple times. Can't recommend it enough.",
  "Overhyped in my opinion. The {dim} was fine but nothing groundbreaking. Expected more given the buzz.",
  "Surprisingly good! The {dim} caught me off guard in the best way. Will definitely rewatch.",
  "Mixed feelings. While the {dim} was excellent, other aspects fell a bit flat. Still a solid film.",
  "One of the best I've seen this year. The {dim} is top-tier and the overall experience is unforgettable.",
  "Not my usual genre but I was hooked from the start. The {dim} really elevated the whole thing.",
];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRatings() {
  const ratings = {};
  for (const key of Object.keys(DIMENSION_LABELS)) {
    ratings[key] = {
      average: randomBetween(3.0, 9.8),
      count: randomInt(5, 200),
    };
  }
  return ratings;
}

function generateReviews() {
  const count = randomInt(2, 6);
  const shuffled = [...USERNAMES].sort(
    () => Math.random() - 0.5,
  );
  const dims = Object.values(DIMENSION_LABELS);

  return Array.from({ length: count }, (_, i) => {
    const dim =
      dims[Math.floor(Math.random() * dims.length)];
    const template =
      REVIEW_TEMPLATES[
        Math.floor(Math.random() * REVIEW_TEMPLATES.length)
      ];

    const daysAgo = randomInt(1, 120);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: `dev_r${Date.now()}_${i}`,
      userId: `dev_u${i}`,
      username: shuffled[i % shuffled.length],
      avatarUrl: null,
      overallStarRating:
        randomBetween(1.0, 5.0) > 4.5
          ? 5.0
          : Math.round(randomBetween(1.0, 5.0) * 2) / 2,
      content: template.replace("{dim}", dim.toLowerCase()),
      likeCount: randomInt(0, 50),
      isLikedByCurrentUser: Math.random() > 0.7,
      createdAt: date.toISOString(),
    };
  });
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function DevToolsProvider({ children }) {
  const [store, setStore] = useState(loadStore);

  const generateMockData = useCallback((mediaKey) => {
    setStore((prev) => {
      const next = {
        ...prev,
        [mediaKey]: {
          ratings: generateRatings(),
          reviews: generateReviews(),
          generatedAt: new Date().toISOString(),
        },
      };
      saveStore(next);
      return next;
    });
  }, []);

  const generateAllRandom = useCallback((mediaKey) => {
    generateMockData(mediaKey);
  }, [generateMockData]);

  const clearMockData = useCallback((mediaKey) => {
    setStore((prev) => {
      const next = { ...prev };
      delete next[mediaKey];
      saveStore(next);
      return next;
    });
  }, []);

  const clearAllMockData = useCallback(() => {
    setStore({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getMockData = useCallback(
    (mediaKey) => store[mediaKey] || null,
    [store],
  );

  return (
    <DevToolsContext.Provider
      value={{
        store,
        generateMockData,
        generateAllRandom,
        clearMockData,
        clearAllMockData,
        getMockData,
      }}
    >
      {children}
    </DevToolsContext.Provider>
  );
}

export function useDevTools() {
  const ctx = useContext(DevToolsContext);
  if (!ctx) {
    throw new Error(
      "useDevTools must be used within DevToolsProvider",
    );
  }
  return ctx;
}
