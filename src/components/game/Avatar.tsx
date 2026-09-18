import { AVATARS, type AvatarId } from './avatars';

export function Avatar({ id, size = 'md', showName }: { id: AvatarId; size?: 'sm' | 'md' | 'lg'; showName?: boolean }) {
  const a = AVATARS[id];
  const px = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';
  return (
    <div className="flex items-center gap-2">
      <img
        src={a.src}
        alt={a.name}
        className={`${px} rounded-full border-2 border-foreground/30 object-cover`}
        style={{ boxShadow: '2px 2px 0 rgba(26,26,46,0.3)', imageRendering: 'auto' }}
      />
      {showName && (
        <div className="min-w-0">
          <div className="text-sm font-black leading-tight truncate">{a.name}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{a.role}</div>
        </div>
      )}
    </div>
  );
}
