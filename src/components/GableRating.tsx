import { cn } from '@/lib/utils';

interface GableRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 'h-4 w-auto', gap: 'gap-0.5', text: 'text-xs' },
  md: { icon: 'h-5 w-auto', gap: 'gap-1', text: 'text-sm' },
  lg: { icon: 'h-7 w-auto', gap: 'gap-1.5', text: 'text-base' },
};

export function GableRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: GableRatingProps) {
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  const fullGables = Math.floor(clampedRating);
  const hasHalfGable = clampedRating % 1 >= 0.5;
  const emptyGables = maxRating - fullGables - (hasHalfGable ? 1 : 0);
  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      <div className={cn('flex items-center', config.gap)} role="img" aria-label={`Bewertung: ${clampedRating} von ${maxRating} Giebeln`}>
        {/* Full gables */}
        {Array.from({ length: fullGables }).map((_, i) => (
          <img
            key={`full-${i}`}
            src="/gable.svg"
            alt=""
            className={cn(config.icon, 'drop-shadow-sm')}
          />
        ))}

        {/* Half gable */}
        {hasHalfGable && (
          <img
            src="/gable_half.svg"
            alt=""
            className={cn(config.icon, 'drop-shadow-sm')}
          />
        )}

        {/* Empty gables */}
        {Array.from({ length: emptyGables }).map((_, i) => (
          <img
            key={`empty-${i}`}
            src="/gable_empty.svg"
            alt=""
            className={config.icon}
          />
        ))}
      </div>

      {showValue && (
        <span className={cn('ml-1.5 font-medium tabular-nums text-muted-foreground', config.text)}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default GableRating;
