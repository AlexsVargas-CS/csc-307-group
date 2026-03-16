import HomeSectionHeader from "./HomeSectionHeader.jsx";
import CategorySpotlightCard from "./CategorySpotlightCard.jsx";
import { CategorySkeleton } from "./HomeSkeletons.jsx";

export default function CategorySpotlightGrid({
  spotlights,
  loading,
}) {
  if (loading) {
    return (
      <section className="px-8 py-10">
        <HomeSectionHeader
          title="Top Rated by Category"
          subtitle="Curated spotlights"
        />
        <CategorySkeleton />
      </section>
    );
  }

  if (!spotlights || spotlights.length === 0) {
    return null;
  }

  return (
    <section className="px-8 py-10">
      <HomeSectionHeader
        title="Top Rated by Category"
        subtitle="Craft-based picks — future home of real Showme dimension rankings"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {spotlights.map((cat) => (
          <CategorySpotlightCard
            key={cat.name}
            category={cat}
          />
        ))}
      </div>
    </section>
  );
}
