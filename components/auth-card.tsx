import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
        {...props}
      />
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {children}
    </button>
  );
}
