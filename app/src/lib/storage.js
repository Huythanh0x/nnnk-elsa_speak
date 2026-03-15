const SK = {
  email: 'elsa_email',
  password: 'elsa_pw',
  accessToken: 'elsa_at',
  sessionToken: 'elsa_st',
  authorId: 'elsa_aid',
  profile: 'elsa_profile',
}

export function getSession() {
  const at = localStorage.getItem(SK.accessToken)
  const st = localStorage.getItem(SK.sessionToken)
  const aid = localStorage.getItem(SK.authorId)
  if (!at || !st || !aid) return null
  return {
    accessToken: at,
    sessionToken: st,
    authorId: aid,
    email: localStorage.getItem(SK.email) || '',
    password: localStorage.getItem(SK.password) || '',
    profile: (() => {
      try { return JSON.parse(localStorage.getItem(SK.profile)) } catch { return null }
    })(),
  }
}

export function saveSession(tokens, email, password) {
  localStorage.setItem(SK.accessToken, tokens.accessToken)
  localStorage.setItem(SK.sessionToken, tokens.sessionToken)
  localStorage.setItem(SK.authorId, tokens.authorId)
  localStorage.setItem(SK.email, email)
  localStorage.setItem(SK.password, password)
  if (tokens.profile) localStorage.setItem(SK.profile, JSON.stringify(tokens.profile))
}

export function clearSession() {
  Object.values(SK).forEach(k => localStorage.removeItem(k))
}
