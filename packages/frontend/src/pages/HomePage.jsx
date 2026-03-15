import { useRef } from "react";
import useHomePageData from "../hooks/useHomePageData.js";
import FeaturedHero from "../components/home/FeaturedHero.jsx";
import HomeSectionHeader from "../components/home/HomeSectionHeader.jsx";
import CategorySpotlightGrid from "../components/home/CategorySpotlightGrid.jsx";
import MostDiscussedList from "../components/home/MostDiscussedList.jsx";
import PulseCard from "../components/home/PulseCard.jsx";
import CuratedListTile from "../components/home/CuratedListTile.jsx";
import FilmRow from "../components/FilmRow/FilmRow.jsx";
import {
  HeroSkeleton,
  RowSkeleton,
} from "../components/home/HomeSkeletons.jsx";

export default function HomePage() {
  const categoriesRef = useRef(null);
  const data = useHomePageData();

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (data.loading) {
    return (
      <main>
        <HeroSkeleton />
        <div className="mx-auto max-w-7xl space-y-12 px-8 py-10">
          <section>
            <div className="mb-6 h-7 w-48 rounded bg-gray-800" />
            <RowSkeleton />
          </section>
          <section>
            <div className="mb-6 h-7 w-56 rounded bg-gray-800" />
            <RowSkeleton count={4} />
          </section>
        </div>
      </main>
    );
  }

  const hasUpcoming =
    data.upcoming && data.upcoming.length > 0;
  const hasPulseCards =
    data.pulseCards && data.pulseCards.length > 0;
  const hasCuratedLists =
    data.curatedLists &&
    data.curatedLists.length > 0;

  return (
    <main>
      {/* 1. Featured Hero */}
      <FeaturedHero
        film={data.hero}
        genreMap={data.genreMap}
        onScrollToCategories={scrollToCategories}
      />

      <div className="mx-auto max-w-7xl space-y-14 pb-16">
        {/* 2. Trending This Week */}
        <FilmRow
          title="Trending This Week"
          films={data.trending}
          loading={false}
          error={data.trending.length === 0}
          genreMap={data.genreMap}
        />

        {/* 3. Top Rated by Category */}
        <div ref={categoriesRef}>
          <CategorySpotlightGrid
            spotlights={data.categorySpotlights}
            loading={false}
          />
        </div>

        {/* 4. Upcoming Releases */}
        {hasUpcoming && (
          <FilmRow
            title="Upcoming Releases"
            films={data.upcoming}
            loading={false}
            error={false}
            genreMap={data.genreMap}
          />
        )}

        {/* 5 & 6. Most Discussed + Community Pulse */}
        <section className="px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            {/* Community Pulse — wider */}
            {hasPulseCards && (
              <div className="lg:col-span-3">
                <HomeSectionHeader
                  title="Why They're Trending"
                  subtitle="What's in the conversation this week"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.pulseCards.map((film) => (
                    <PulseCard
                      key={film.tmdbId}
                      film={film}
                      genreMap={data.genreMap}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Most Discussed — compact sidebar */}
            <div
              className={
                hasPulseCards
                  ? "lg:col-span-2"
                  : ""
              }
            >
              <MostDiscussedList
                films={data.mostDiscussed}
                loading={false}
              />
            </div>
          </div>
        </section>

        {/* 7. Curated Lists */}
        {hasCuratedLists && (
          <section className="px-8">
            <HomeSectionHeader
              title="Curated Lists"
              subtitle="Editorially grouped from what's trending"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.curatedLists.map((list) => (
                <CuratedListTile
                  key={list.title}
                  list={list}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
