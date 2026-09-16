import type { ReactNode } from 'react';

export function CiteLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-brand underline-offset-2 hover:underline ${className ?? ''}`}
    >
      {children}
    </a>
  );
}
