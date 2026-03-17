export function NuzzleLogo({ className = '', iconOnly = false, size = 'md' }: { className?: string; iconOnly?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-sm' },
    md: { icon: 28, text: 'text-lg' },
    lg: { icon: 36, text: 'text-xl' },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 4-pointed star icon */}
      <div className="rounded-lg bg-sage-dark p-1.5 flex items-center justify-center">
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 2C16 2 19 12 16 16C12 16 2 16 2 16C2 16 12 13 16 16C16 20 16 30 16 30C16 30 13 20 16 16C20 16 30 16 30 16C30 16 20 19 16 16Z"
            fill="hsl(var(--primary-foreground))"
          />
          <path
            d="M16 4C17.5 10.5 21.5 14.5 28 16C21.5 17.5 17.5 21.5 16 28C14.5 21.5 10.5 17.5 4 16C10.5 14.5 14.5 10.5 16 4Z"
            fill="hsl(var(--primary-foreground))"
          />
        </svg>
      </div>
      {!iconOnly && (
        <span className={`font-heading ${s.text} text-foreground tracking-tight`}>
          Nuzzle Health
        </span>
      )}
    </div>
  );
}
