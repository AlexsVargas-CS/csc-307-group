export default function HomeSectionHeader({
  title,
  subtitle,
  action,
  onAction,
}) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-amber-400 transition hover:text-amber-300"
        >
          {action} &rarr;
        </button>
      )}
    </div>
  );
}
