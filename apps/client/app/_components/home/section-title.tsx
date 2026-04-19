export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <p className={`font-display text-3xl font-bold uppercase italic sm:text-4xl ${className}`}>
      {children}
    </p>
  );
}
