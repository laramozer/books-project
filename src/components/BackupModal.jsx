import { useState, useEffect } from 'react'
import { CloseIcon } from './Icons'
import { getToken, getGistId, getLastBackup, saveToken, clearBackupConfig, validateToken, saveBackup, loadBackup } from '../backup'
import { db } from '../db'

export default function BackupModal({ onClose }) {
  const [step, setStep]         = useState(getToken() ? 'connected' : 'setup')
  const [tokenInput, setToken]  = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [user, setUser]         = useState(null)
  const [lastBackup, setLast]   = useState(getLastBackup())
  const [syncing, setSyncing]   = useState(false)
  const [syncMsg, setSyncMsg]   = useState('')

  useEffect(() => {
    if (step === 'connected') {
      validateToken(getToken()).then(setUser).catch(() => {})
    }
  }, [step])

  async function handleConnect() {
    if (!tokenInput.trim()) return
    setLoading(true)
    setError('')
    try {
      const u = await validateToken(tokenInput.trim())
      saveToken(tokenInput.trim())
      setUser(u)
      setStep('connected')
    } catch {
      setError('Token inválido. Verifique e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleManualBackup() {
    setSyncing(true)
    setSyncMsg('')
    try {
      const books = await db.books.toArray()
      const saved = await saveBackup(books)
      setLast(saved)
      setSyncMsg('Backup salvo com sucesso!')
    } catch (e) {
      setSyncMsg(`Erro: ${e.message}`)
    } finally {
      setSyncing(false)
    }
  }

  async function handleRestore() {
    setSyncing(true)
    setSyncMsg('')
    try {
      const data = await loadBackup()
      if (!data?.books?.length) { setSyncMsg('Nenhum backup encontrado.'); return }
      let added = 0
      for (const book of data.books) {
        if (!book.id || !book.title) continue
        const exists = await db.books.get(book.id)
        if (!exists) { await db.books.add(book); added++ }
      }
      setSyncMsg(`${added} livro(s) restaurado(s)!`)
    } catch (e) {
      setSyncMsg(`Erro: ${e.message}`)
    } finally {
      setSyncing(false)
    }
  }

  function handleDisconnect() {
    clearBackupConfig()
    setStep('setup')
    setUser(null)
    setToken('')
    setSyncMsg('')
  }

  function formatDate(iso) {
    if (!iso) return null
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#1a0a3d]/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-purple-900/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-purple-100 bg-gradient-to-br from-[#f3eeff] to-white">
          <div>
            <p className="font-bold text-[#3d1d80] text-base">Backup na nuvem</p>
            <p className="text-purple-400 text-xs mt-0.5">Via GitHub Gist · gratuito</p>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-purple-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-purple-50">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {step === 'setup' ? (
            <>
              {/* Instruções */}
              <div className="bg-purple-50 rounded-2xl p-4 flex flex-col gap-2.5">
                <p className="text-xs font-bold text-[#6b48b0]">Como configurar (só uma vez):</p>
                <ol className="flex flex-col gap-1.5">
                  {[
                    <>Acesse <a href="https://github.com/settings/tokens/new?scopes=gist&description=MinhaEstante" target="_blank" rel="noreferrer" className="text-[#6b48b0] underline font-semibold">este link</a> no GitHub</>,
                    'Clique em "Generate token" no final da página',
                    'Copie o token gerado e cole abaixo',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="bg-[#6b48b0] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-xs text-purple-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-purple-500">Token do GitHub</label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-purple-900 font-mono"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <button
                onClick={handleConnect}
                disabled={loading || !tokenInput.trim()}
                className="w-full bg-[#6b48b0] hover:bg-[#7d57c8] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Verificando...' : 'Conectar'}
              </button>
            </>
          ) : (
            <>
              {/* Conectado */}
              {user && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  {user.avatar_url && (
                    <img src={user.avatar_url} alt={user.login} className="w-9 h-9 rounded-full" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-green-700">Conectado!</p>
                    <p className="text-xs text-green-600">@{user.login}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] bg-green-100 text-green-600 font-bold px-2 py-1 rounded-full">●  ativo</span>
                  </div>
                </div>
              )}

              {!getGistId() && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <p className="text-xs font-bold text-amber-700 mb-1">Primeiro backup pendente</p>
                  <p className="text-xs text-amber-600">Clique em <strong>"Salvar agora"</strong> para criar o seu backup na nuvem pela primeira vez.</p>
                </div>
              )}

              <div className="bg-purple-50 rounded-2xl px-4 py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-purple-500 font-semibold">Backup automático ativo</p>
                  {getGistId() && (
                    <a
                      href="https://gist.github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#6b48b0] underline font-semibold hover:text-purple-800"
                    >
                      Ver no GitHub →
                    </a>
                  )}
                </div>
                <p className="text-xs text-purple-400">
                  Salvo automaticamente a cada alteração nos seus livros.
                </p>
                {lastBackup ? (
                  <p className="text-xs text-purple-300 mt-1">Último backup: {formatDate(lastBackup)}</p>
                ) : (
                  <p className="text-xs text-purple-300 mt-1">Nenhum backup realizado ainda.</p>
                )}
              </div>

              {syncMsg && (
                <p className={`text-xs font-semibold px-3 py-2 rounded-xl ${syncMsg.startsWith('Erro') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                  {syncMsg}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleManualBackup}
                  disabled={syncing}
                  className="flex-1 bg-[#6b48b0] hover:bg-[#7d57c8] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {syncing ? 'Salvando...' : '↑ Salvar agora'}
                </button>
                <button
                  onClick={handleRestore}
                  disabled={syncing || !getGistId()}
                  className="flex-1 bg-purple-100 hover:bg-purple-200 disabled:opacity-40 text-[#6b48b0] font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {syncing ? '...' : '↓ Restaurar'}
                </button>
              </div>

              <button
                onClick={handleDisconnect}
                className="text-xs text-red-400 hover:text-red-500 text-center py-1"
              >
                Desconectar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
