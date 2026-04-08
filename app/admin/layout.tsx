export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-contrast-ink)]">
      {children}
    </div>
  );
}
