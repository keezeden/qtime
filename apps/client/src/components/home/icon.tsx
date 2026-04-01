type IconProps = {
  label: string;
  className?: string;
};

export function SymbolIcon({ label, className = "" }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center font-display font-black uppercase ${className}`}
    >
      {label}
    </span>
  );
}
