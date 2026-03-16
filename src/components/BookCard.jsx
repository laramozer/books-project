import { useState, useRef, useEffect } from 'react'
import StarRating from './StarRating'
import { DotsIcon, TrashIcon, EditIcon } from './Icons'

export default function BookCard({ book, onDelete, onUpdateRating, onUpdateProgress }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressMode, setProgressMode] = useState('pages')
  const [pageInput, setPageInput] = useState(book.currentPage ?? 0)
  const [totalInput, setTotalInput] = useState(book.pages ?? '')
  const [percentInput, setPercentInput] = useState(book.progress ?? 0)
  const menuRef = useRef(null)

  const totalPages = book.pages || null

  const progress = totalPages && totalPages > 0
    ? Math.round(((book.currentPage ?? 0) / totalPages) * 100)
    : (book.progress ?? 0)

  const liveTotal = Number(totalInput) || 0
  const livePage  = Math.min(liveTotal || Infinity, Math.max(0, Number(pageInput)))
  const livePercent = progressMode === 'percent'
    ? Math.min(100, Math.max(0, Number(percentInput) || 0))
    : (liveTotal > 0 ? Math.round((livePage / liveTotal) * 100) : 0)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openEditing() {
    setPageInput(book.currentPage ?? 0)
    setTotalInput(book.pages ?? '')
    setPercentInput(book.progress ?? 0)
    setProgressMode(book.pages || (book.currentPage ?? 0) > 0 ? 'pages' : 'percent')
    setEditingProgress(true)
  }

  function submitProgress(e) {
    e?.preventDefault()
    if (progressMode === 'percent') {
      const pct = Math.min(100, Math.max(0, Number(percentInput) || 0))
      onUpdateProgress(book.id, pct, 0, null)
    } else {
      const total = Number(totalInput) || null
      const page  = total ? Math.min(total, Math.max(0, Number(pageInput))) : Math.max(0, Number(pageInput))
      const pct   = total ? Math.round((page / total) * 100) : 0
      onUpdateProgress(book.id, pct, page, total)
    }
    setEditingProgress(false)
  }

  function progressLabel() {
    if (totalPages) return `${book.currentPage ?? 0} / ${totalPages}`
    if ((book.currentPage ?? 0) > 0) return `Pág. ${book.currentPage}`
    return `${book.progress ?? 0}%`
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md bg-purple-100 group">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 gap-2 p-3">
            <div className="w-10 h-10 rounded-xl bg-purple-200 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9b7ec8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <p className="text-[10px] text-center text-purple-400 font-medium leading-tight line-clamp-3">{book.title}</p>
          </div>
        )}

        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10">
            <div
              className="h-full bg-[#c4a8e8] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Title & author */}
      <div className="px-0.5">
        <p className="text-xs font-semibold text-[#3d1d80] leading-tight line-clamp-2">{book.title}</p>
        <p className="text-xs text-purple-400 mt-0.5 truncate">{book.author}</p>
      </div>

      {/* Progress editor */}
      {editingProgress ? (
        <form
          onSubmit={submitProgress}
          className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 flex flex-col gap-2"
        >
          {/* Seletor de modo */}
          <div className="flex gap-0.5 bg-purple-200/50 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setProgressMode('pages')}
              className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all ${
                progressMode === 'pages'
                  ? 'bg-white text-[#6b48b0] shadow-sm'
                  : 'text-purple-400 hover:text-purple-600'
              }`}
            >
              Páginas
            </button>
            <button
              type="button"
              onClick={() => setProgressMode('percent')}
              className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all ${
                progressMode === 'percent'
                  ? 'bg-white text-[#6b48b0] shadow-sm'
                  : 'text-purple-400 hover:text-purple-600'
              }`}
            >
              % Ebook
            </button>
          </div>

          {/* Campos */}
          {progressMode === 'pages' ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-purple-400 font-medium shrink-0">Pág.</span>
              <input
                autoFocus
                type="number"
                min={0}
                placeholder="0"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="flex-1 min-w-0 text-xs border border-purple-300 rounded-lg px-1 py-1 outline-none text-center bg-white text-purple-800 font-semibold focus:ring-2 focus:ring-purple-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] text-purple-400 shrink-0">de</span>
              <input
                type="number"
                min={1}
                placeholder="total"
                value={totalInput}
                onChange={(e) => setTotalInput(e.target.value)}
                className="flex-1 min-w-0 text-xs border border-purple-300 rounded-lg px-1 py-1 outline-none text-center bg-white text-purple-600 focus:ring-2 focus:ring-purple-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={percentInput}
                onChange={(e) => setPercentInput(e.target.value)}
                className="flex-1 min-w-0 text-xs border border-purple-300 rounded-lg px-1 py-1 outline-none text-center bg-white text-purple-800 font-semibold focus:ring-2 focus:ring-purple-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] text-purple-400 font-medium shrink-0">%</span>
            </div>
          )}

          {/* Barra + % ao vivo */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-purple-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9b7ec8] rounded-full transition-all duration-200"
                style={{ width: `${livePercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#6b48b0] shrink-0 w-8 text-right">
              {livePercent}%
            </span>
          </div>

          <div className="flex gap-1.5">
            <button
              type="submit"
              className="flex-1 bg-[#6b48b0] hover:bg-[#7d57c8] text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditingProgress(false)}
              className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-600 text-[11px] font-bold py-1.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-1 px-0.5">
          <button
            onClick={openEditing}
            className="text-xs font-bold text-purple-400 hover:text-[#6b48b0] transition-colors shrink-0"
            title="Editar progresso"
          >
            {progressLabel()}
          </button>

          <div className="flex-1">
            <StarRating
              value={book.rating}
              onChange={(v) => onUpdateRating(book.id, v)}
              size="sm"
            />
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-purple-300 hover:text-[#6b48b0] transition-colors p-0.5 rounded"
            >
              <DotsIcon size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-7 bg-white rounded-2xl shadow-2xl border border-purple-100 py-1.5 w-40 z-50 overflow-hidden">
                <button
                  onClick={() => { openEditing(); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <EditIcon size={14} className="text-purple-400" />
                  Progresso
                </button>
                <div className="my-1 border-t border-purple-50" />
                <button
                  onClick={() => { onDelete(book.id); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <TrashIcon size={14} className="text-red-400" />
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
