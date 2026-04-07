import { useRef, useState } from 'react'
import { LayersIcon, PlusIcon, TargetIcon } from './Icons'
import { exportBooks, importBooks } from '../db'
import { getToken } from '../backup'

function NavButton({ item: { id, label, icon: Icon, count }, activeTab, onTabChange }) {
  const active = activeTab === id
  return (
    <button
      onClick={() => onTabChange(id)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${
        active
          ? 'bg-[#ede8ff] text-[#6b48b0]'
          : 'text-purple-400 hover:bg-purple-50 hover:text-[#6b48b0]'
      }`}
    >
      <Icon size={17} />
      <span className="flex-1">{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
        active ? 'bg-[#6b48b0] text-white' : 'bg-purple-100 text-purple-400'
      }`}>
        {count}
      </span>
    </button>
  )
}

export default function Sidebar({ mainNavItems, formatNavItems, activeTab, onTabChange, onAdd, onOpenBackup, totalBooks, backupStatus, goalsNavItem }) {
  const fileRef = useRef(null)
  const [toast, setToast] = useState(null)

  function showToast(msg, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleExport() {
    try {
      await exportBooks()
      showToast('Backup exportado com sucesso!')
    } catch {
      showToast('Erro ao exportar.', false)
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const added = await importBooks(file)
      showToast(`${added} livro(s) importado(s)!`)
    } catch {
      showToast('Arquivo inválido.', false)
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-purple-100 fixed top-0 left-0 z-50">
      <div className="px-6 py-7 flex items-center gap-3 border-b border-purple-100">
        <div className="w-9 h-9 rounded-xl bg-[#ede8ff] flex items-center justify-center">
          <LayersIcon size={20} className="text-[#6b48b0]" />
        </div>
        <div>
          <p className="text-[#3d1d80] font-bold text-base leading-tight">Minha Estante</p>
          <p className="text-purple-400 text-xs">{totalBooks} {totalBooks === 1 ? 'livro' : 'livros'}</p>
        </div>
      </div>

      <nav className="flex flex-col px-3 py-6 flex-1 gap-5 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Biblioteca</p>
          {mainNavItems.map((item) => (
            <NavButton key={item.id} item={item} activeTab={activeTab} onTabChange={onTabChange} />
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Formato</p>
          {formatNavItems.map((item) => (
            <NavButton key={item.id} item={item} activeTab={activeTab} onTabChange={onTabChange} />
          ))}
        </div>

        {goalsNavItem && (
          <div className="flex flex-col gap-0.5">
            <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Objetivos</p>
            <button
              onClick={() => onTabChange(goalsNavItem.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${
                activeTab === goalsNavItem.id
                  ? 'bg-[#ede8ff] text-[#6b48b0]'
                  : 'text-purple-400 hover:bg-purple-50 hover:text-[#6b48b0]'
              }`}
            >
              <TargetIcon size={17} />
              <span className="flex-1">{goalsNavItem.label}</span>
            </button>
          </div>
        )}
      </nav>

      <div className="px-4 pb-6 flex flex-col gap-2">
        {/* Backup */}
        <div>
          <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest px-1 mb-2">Backup</p>
          <div className="flex gap-1.5">
            {/* Nuvem (GitHub Gist) */}
            <button
              onClick={onOpenBackup}
              title="Backup na nuvem"
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                backupStatus === 'saving' ? 'border-purple-300 text-purple-500 bg-purple-50 animate-pulse' :
                backupStatus === 'saved'  ? 'border-green-200 text-green-600 bg-green-50' :
                backupStatus === 'error'  ? 'border-red-200 text-red-400 bg-red-50' :
                getToken() ? 'border-purple-200 text-purple-500 hover:bg-purple-50' :
                'border-dashed border-purple-200 text-purple-400 hover:bg-purple-50'
              }`}
            >
              {backupStatus === 'saving' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : backupStatus === 'saved' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : backupStatus === 'error' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              )}
              {backupStatus === 'saving' ? 'Salvando…' :
               backupStatus === 'saved'  ? 'Salvo!' :
               backupStatus === 'error'  ? 'Erro' :
               getToken() ? 'Nuvem ✓' : 'Nuvem'}
            </button>

            {/* Exportar JSON local */}
            <button
              onClick={handleExport}
              title="Exportar backup JSON"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-purple-200 text-purple-500 hover:bg-purple-50 text-xs font-semibold transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              JSON
            </button>

            {/* Importar JSON local */}
            <button
              onClick={() => fileRef.current?.click()}
              title="Importar backup JSON"
              className="flex-shrink-0 flex items-center justify-center py-2 px-2.5 rounded-xl border border-purple-200 text-purple-400 hover:bg-purple-50 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </div>

        {/* Adicionar */}
        <button
          onClick={onAdd}
          className="w-full bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-purple-200"
        >
          <PlusIcon size={16} />
          Adicionar livro
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-6 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all ${
          toast.ok ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'
        }`}>
          {toast.msg}
        </div>
      )}
    </aside>
  )
}
