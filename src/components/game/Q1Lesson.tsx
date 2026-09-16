import { useState } from 'react';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';
import { SOURCE_URLS } from '@/lib/sources';

export function Q1Lesson() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <GameSection title="The job" hint={<button className="text-white/80" onClick={() => setOpen(false)} aria-label="Dismiss">✕</button>}>
      <ol className="text-sm space-y-2 list-decimal pl-5">
        <li>
          <strong className="text-foreground">Risk assessment</strong>: find which systems are vulnerable and how likely attacks are.
          About 50 to 60 percent fewer security defects when this is part of the lifecycle (
          <CiteLink href={SOURCE_URLS['Microsoft SDL']}>Howard, MSDN 2005</CiteLink>
          ).
        </li>
        <li>
          <strong className="text-foreground">Guidance</strong>: instruct the team where and how to apply each tool.
          Listing risks is not a defense (
          <CiteLink href={SOURCE_URLS['Microsoft / ACSAC']}>Lipner, ACSAC 2004</CiteLink>
          ).
          A production fix costs about 30 times a design-time fix (
          <CiteLink href={SOURCE_URLS['NIST / SEI']}>NIST / SEI</CiteLink>
          ).
        </li>
        <li>
          <strong className="text-foreground">Matching tools</strong>: buy what that assessment called for.
          Prevention workflows cut average breach cost $2.2M (
          <CiteLink href={SOURCE_URLS['IBM Cost of a Data Breach 2024']}>IBM Cost of a Data Breach 2024</CiteLink>
          ).
        </li>
      </ol>
    </GameSection>
  );
}
