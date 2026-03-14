import { useRef } from "react";
import FilmCard from "../FilmCard.jsx";

function SkeletonCard() {
  return (
    <div className="w-40 flex-shrink-0 snap-start sm:w-44 md:w-48">
      <div className="animate-pulse rounded-lg bg-gray-800">
        <div className="aspect-[2/3] w-full rounded-t-lg bg-gray-700" />
        <div className="p-3">
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-700" />
          <div className="h-3 w-1/2 rounded bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export default function FilmRow({
  title,
  seeAllHref = "#",
  films,
  loading,
  error,
  genreMap
}) {
  const scrollRef = useRef(null);

  function scroll(direction) {
    if (!scrollRef.current) return;
    const amount =
      scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth"
    });
  }

  return (
    <section className="px-6 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>
        <a
          href={seeAllHref}
          className="text-sm font-medium text-amber-400 transition hover:text-amber-300"
        >
          See All &rarr;
        </a>
      </div>

      {/* Error state */}
      {error && (
        <p className="rounded-lg bg-gray-800/50 py-8 text-center text-sm text-gray-400">
          Unable to load {title.toLowerCase()} right
          now.
        </p>
      )}

      {/* Row */}
      {!error && (
        <div className="group/row relative">
          {/* Left chevron */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-gray-800/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-gray-700 group-hover/row:block"
            aria-label="Scroll left"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory"
          >
            {loading
              ? Array.from({ length: 8 }).map(
                  (_, i) => <SkeletonCard key={i} />
                )
              : films.map((film) => (
                  <div
                    key={`${film.type}-${film.tmdbId}`}
                    className="w-40 flex-shrink-0 snap-start sm:w-44 md:w-48"
                  >
                    <FilmCard
                      film={film}
                      genreMap={genreMap}
                    />
                  </div>
                ))}
          </div>

          {/* Right chevron */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-gray-800/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-gray-700 group-hover/row:block"
            aria-label="Scroll right"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
