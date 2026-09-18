import type { ReactNode } from 'react';

export function CiteLink({ href, children, className, title, ariaLabel }: {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={ariaLabel}
      className={`text-brand underline-offset-2 hover:underline ${className ?? ''}`}
    >
      {children}
    </a>
  );
}
