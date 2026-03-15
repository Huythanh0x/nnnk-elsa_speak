export default function Profile({ profile, onLogout }) {
  if (!profile) {
    return (
      <div className="bg-surface border border-[#2d2d35] rounded-xl px-4 py-3 text-zinc-400 text-sm">
        Loading profile…
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.username || ''}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#2d2d35]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-semibold text-sm">
            {(profile.username || profile.email || '?')[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-zinc-100 leading-tight">{profile.username || '—'}</p>
          <p className="text-sm text-zinc-400 leading-tight">{profile.email || ''}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        Switch account
      </button>
    </div>
  )
}
