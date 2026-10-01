/** Tarjeta de sellos: un círculo por visita; el último lleva el premio. */
export function StampCard({
  count,
  required,
  highlightLast = false,
  size = "lg",
}: {
  count: number;
  required: number;
  highlightLast?: boolean;
  size?: "lg" | "sm";
}) {
  const filled = Math.min(count, required);
  const cols = required <= 4 ? required : required <= 10 ? 5 : required <= 12 ? 6 : 6;
  const dim = size === "lg" ? "w-full aspect-square" : "w-full aspect-square";

  return (
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: size === "lg" ? 360 : 280 }}
      role="img"
      aria-label={`${filled} / ${required}`}
    >
      {Array.from({ length: required }, (_, i) => {
        const on = i < filled;
        const isReward = i === required - 1;
        const pop = highlightLast && on && i === filled - 1;
        return (
          <div
            key={i}
            className={`${dim} relative flex items-center justify-center rounded-full ${
              on ? "bg-brand text-brand-fg" : isReward ? "border-2 border-dashed border-brand/60 text-brand" : "border-2 border-line text-line"
            } ${pop ? "stamp-pop" : ""}`}
          >
            {isReward ? <GiftIcon /> : on ? <CheckIcon /> : <span className="text-xs font-semibold text-muted/60">{i + 1}</span>}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
      <path d="M5 12.5V20h14v-7.5M12 8.5V20" />
      <path d="M12 8.5C10.5 5 7 5 7 7c0 1.5 2.5 1.5 5 1.5zM12 8.5C13.5 5 17 5 17 7c0 1.5-2.5 1.5-5 1.5z" />
    </svg>
  );
}
