import { Avatar } from './Avatar';
import type { AvatarId } from './avatars';

export function PersonaMessage({ id, line, compact }: { id: AvatarId; line: string; compact?: boolean }) {
  if (!line) return null;
  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${compact ? 'py-1' : 'py-2'}`}>
      <Avatar id={id} size={compact ? 'sm' : 'md'} />
      <div className={`flex-1 min-w-0 comic-card-flat px-3 py-2 ${compact ? 'text-sm' : ''}`}>
        <p className="handwritten leading-snug">"{line}"</p>
      </div>
    </div>
  );
}

export function PersonaMessageInline({ id, line }: { id: AvatarId; line: string }) {
  if (!line) return null;
  return (
    <div className="flex items-center gap-2 py-1">
      <Avatar id={id} size="sm" />
      <p className="handwritten text-sm leading-snug flex-1 min-w-0">"{line}"</p>
    </div>
  );
}
