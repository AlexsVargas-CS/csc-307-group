import { useState } from "react";

/**
 * Reusable star rating component.
 *
 * Props:
 *  - value       : number (0–5)
 *  - onChange     : (newValue) => void  (only used in interactive mode)
 *  - mode        : "display" | "interactive"  (default "display")
 *  - starCount   : number of stars (default 5)
 *  - size        : tailwind text-size class (default "text-lg")
 */
export default function StarRating({
  value = 0,
  onChange,
  mode = "display",
  starCount = 5,
  size = "text-lg",
}) {
  const [hoverValue, setHoverValue] = useState(null);
  const displayValue =
    hoverValue !== null ? hoverValue : value;
  const interactive = mode === "interactive";

  function handleClick(starIndex, e) {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;
    const newValue = isLeftHalf
      ? starIndex + 0.5
      : starIndex + 1;
    // Toggle off if clicking the same value
    onChange?.(newValue === value ? 0 : newValue);
  }

  function handleMouseMove(starIndex, e) {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setHoverValue(
      isLeftHalf ? starIndex + 0.5 : starIndex + 1,
    );
  }

  function handleMouseLeave() {
    if (!interactive) return;
    setHoverValue(null);
  }

  return (
    <div
      className={`flex items-center gap-0.5 ${size}`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: starCount }, (_, i) => {
        const fillLevel = Math.min(
          Math.max(displayValue - i, 0),
          1,
        );

        return (
          <span
            key={i}
            className={`relative select-none ${interactive ? "cursor-pointer" : ""}`}
            onClick={(e) => handleClick(i, e)}
            onMouseMove={(e) => handleMouseMove(i, e)}
          >
            {/* Empty star (background) */}
            <span className="text-gray-600">★</span>

            {/* Filled overlay */}
            {fillLevel > 0 && (
              <span
                className="pointer-events-none absolute left-0 top-0 overflow-hidden text-amber-400"
                style={{ width: `${fillLevel * 100}%` }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
