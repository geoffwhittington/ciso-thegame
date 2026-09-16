import type { ReactNode } from 'react';

export function CiteLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-orange-400 underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
}
