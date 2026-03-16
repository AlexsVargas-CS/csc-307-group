import StarRating from "../StarRating/StarRating.jsx";

/**
 * A single community-dimension rating row.
 *
 * Props:
 *  - label   : string (e.g. "Acting")
 *  - average : number 0–10
 *  - count   : number of ratings
 */
export default function DimensionBar({
  label,
  average,
  count,
}) {
  const pct = (average / 10) * 100;
  const starValue = average / 2; // 0–10 → 0–5

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">
          {label}
        </span>
        <span className="text-xs text-gray-500">
          {count} ratings
        </span>
      </div>

      {/* Bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stars + numeric score */}
      <div className="mt-1 flex items-center gap-2">
        <StarRating
          value={starValue}
          mode="display"
          size="text-sm"
        />
        <span className="text-xs text-gray-400">
          {average.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
