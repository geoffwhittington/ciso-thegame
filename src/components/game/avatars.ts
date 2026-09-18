import cisoPng from '@/assets/avatar-ciso.png';
import ceoPng from '@/assets/avatar-ceo.png';
import analystPng from '@/assets/avatar-analyst.png';
import boardPng from '@/assets/avatar-board.png';
import compliancePng from '@/assets/avatar-compliance.png';

export const AVATARS = {
  ciso: { src: cisoPng, name: 'You', role: 'CISO' },
  ceo: { src: ceoPng, name: 'Marcus Cole', role: 'CEO' },
  analyst: { src: analystPng, name: 'Dev Patel', role: 'Security Lead' },
  board: { src: boardPng, name: 'Victoria Chen', role: 'Board Chair' },
  compliance: { src: compliancePng, name: 'Amara Osei', role: 'GRC Manager' },
} as const;

export type AvatarId = keyof typeof AVATARS;
