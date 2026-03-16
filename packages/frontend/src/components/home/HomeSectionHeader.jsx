export default function HomeSectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="mb-6">
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
    </div>
  );
}
