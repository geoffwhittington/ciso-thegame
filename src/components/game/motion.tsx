import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduce;
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = usePrefersReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) { setN(value); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 700);
      const eased = 1 - (1 - p) ** 3;
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);
  return <span className={className}>{n}</span>;
}

export function FlashOnChange({ value, children }: { value: number; children: ReactNode }) {
  const prev = useRef(value);
  const [dir, setDir] = useState<'up' | 'down' | null>(null);
  useEffect(() => {
    if (prev.current === value) return;
    setDir(value < prev.current ? 'down' : 'up');
    prev.current = value;
    const id = window.setTimeout(() => setDir(null), 650);
    return () => window.clearTimeout(id);
  }, [value]);
  const flash = dir === 'down' ? 'ciso-flash-down' : dir === 'up' ? 'ciso-flash-up' : '';
  return <span className={`inline-block rounded-md px-1 -mx-1 ${flash}`}>{children}</span>;
}

export function enterStyle(i: number): CSSProperties {
  return { animationDelay: `${50 + i * 70}ms` };
}
