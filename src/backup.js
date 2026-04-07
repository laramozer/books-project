const FILENAME  = 'minha-estante-backup.json'
const TOKEN_KEY = 'minha_estante_gh_token'
const GIST_KEY  = 'minha_estante_gist_id'
const LAST_KEY  = 'minha_estante_last_backup'

export const getToken  = () => localStorage.getItem(TOKEN_KEY)
export const getGistId = () => localStorage.getItem(GIST_KEY)
export const getLastBackup = () => localStorage.getItem(LAST_KEY)

export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearBackupConfig() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(GIST_KEY)
  localStorage.removeItem(LAST_KEY)
}

async function ghFetch(url, options = {}) {
  const token = getToken()
  if (!token) throw new Error('Token não configurado')
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
}

export async function saveBackup(books) {
  const content = JSON.stringify(
    { version: 1, savedAt: new Date().toISOString(), books },
    null,
    2
  )
  const gistId = getGistId()

  if (gistId) {
    const res = await ghFetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      body: JSON.stringify({ files: { [FILENAME]: { content } } }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message ?? 'Erro ao atualizar backup')
    }
  } else {
    const res = await ghFetch('https://api.github.com/gists', {
      method: 'POST',
      body: JSON.stringify({
        description: 'Minha Estante — backup automático',
        public: false,
        files: { [FILENAME]: { content } },
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message ?? 'Erro ao criar backup')
    }
    const data = await res.json()
    localStorage.setItem(GIST_KEY, data.id)
  }

  const now = new Date().toISOString()
  localStorage.setItem(LAST_KEY, now)
  return now
}

export async function loadBackup() {
  const gistId = getGistId()
  if (!gistId) return null
  const res = await ghFetch(`https://api.github.com/gists/${gistId}`)
  if (!res.ok) return null
  const data = await res.json()
  const content = data.files?.[FILENAME]?.content
  if (!content) return null
  return JSON.parse(content)
}

export async function validateToken(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${token}` },
  })
  if (!res.ok) throw new Error('Token inválido')
  return res.json()
}
