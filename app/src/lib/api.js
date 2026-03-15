const BASE_URL = 'https://pool.elsanow.io'
const LOGIN_URL = `${BASE_URL}/user/api/v2/account/login?verify=1772121893-h6CRzRqIP%2Fq1rTrkj9X7o5dFALReze460drbbRXsDb0%3D`
const STUDY_SET_URL = `${BASE_URL}/clubs-server/v2/study_sets`
const USER_AGENT = 'elsa-google-play/7.2.9'

function request(method, url, body, tokens) {
  const headers = {
    'user-agent': USER_AGENT,
    'content-type': 'application/json; charset=UTF-8',
  }
  if (tokens) {
    headers['x-access-token'] = tokens.at
    headers['x-session-token'] = tokens.st
  }
  return fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
}

export async function login(email, password) {
  let res
  try {
    res = await request('POST', LOGIN_URL, { email, password })
  } catch {
    throw new Error('Network error. CORS issue? Try the Python script instead.')
  }
  let data
  try { data = await res.json() } catch {
    throw new Error('Non-JSON response — likely a CORS block. Use the Python script.')
  }
  if (!res.ok) throw new Error(data.message || data.error || `Login failed (${res.status})`)
  const p = data.profile || {}
  const at = data.refresh_token
  const st = data.session
  const id = p.user_id
  if (!at || !st || !id) throw new Error('Login succeeded but tokens are missing.')
  return { accessToken: at, sessionToken: st, authorId: id, profile: p }
}

export async function createStudySet(tokens, title, phrases) {
  const res = await request(
    'POST',
    STUDY_SET_URL,
    { author_id: tokens.authorId, is_public: false, name: title, phrases, tag_id: 'other' },
    { at: tokens.accessToken, st: tokens.sessionToken },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed')
  return data
}

export function buildPhrase(line) {
  const name = line.trim()
  if (!name) return null
  return {
    audio_url: '',
    definition: '',
    external_id: '',
    name,
    transcript: name.split(/\s+/).filter(Boolean).map(w => ({ text: w, trans: ['-'], transcript_ipa: '' })),
    translation: {},
  }
}
