const STAR_PATH =
  "M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.77l-5.8 3.05 1.1-6.46-4.7-4.58 6.5-.94L12 2.5z"

/** One star, filled 0–1 of its width — lets an average show partial stars. */
export function Star({ fill, size = 20 }: { fill: number; size?: number }) {
  const clamped = Math.max(0, Math.min(1, fill))
  return (
    <span
      className="relative inline-block shrink-0 align-middle"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="text-border-strong absolute inset-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      >
        <path d={STAR_PATH} />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${clamped * 100}%` }}
      >
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className="text-foreground"
          fill="currentColor"
        >
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  )
}

/** Read-only row of five stars filled to `value` (0–5). */
export function StarRow({ value, size }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} fill={value - i} size={size} />
      ))}
    </span>
  )
}
