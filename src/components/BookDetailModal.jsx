import { useState, useRef } from 'react'
import StarRating from './StarRating'
import { CloseIcon, TrashIcon, HeartIcon, EditIcon } from './Icons'

const MODES = { pages: 'pages', percent: 'percent' }

export default function BookDetailModal({
  book, onClose, onDelete,
  onUpdateRating, onUpdateProgress, onToggleFavorite, onUpdateFormat, onUpdateReview, onUpdateBook,
}) {
  const totalPages = book.pages || null
  const progress = totalPages && totalPages > 0
    ? Math.round(((book.currentPage ?? 0) / totalPages) * 100)
    : (book.progress ?? 0)

  const [progressMode, setProgressMode] = useState(MODES.pages)
  const [pageInput, setPageInput]       = useState(book.currentPage ?? 0)
  const [totalInput, setTotalInput]     = useState(book.pages ?? '')
  const [percentInput, setPercentInput] = useState(book.progress ?? 0)
  const [yearInput, setYearInput]       = useState(book.yearRead ?? '')
  const [review, setReview]             = useState(book.review ?? '')
  const [reviewSaved, setReviewSaved]   = useState(false)

  const [editing, setEditing]           = useState(false)
  const [editTitle, setEditTitle]       = useState(book.title ?? '')
  const [editAuthor, setEditAuthor]     = useState(book.author ?? '')
  const [editYear, setEditYear]         = useState(book.year ?? '')
  const [editPages, setEditPages]       = useState(book.pages ?? '')
  const [editCover, setEditCover]       = useState(book.cover ?? '')
  const [coverMode, setCoverMode]       = useState('upload')
  const fileInputRef = useRef(null)

  function handleCoverFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setEditCover(ev.target.result)
    reader.readAsDataURL(file)
  }

  function saveDetails(e) {
    e?.preventDefault()
    onUpdateBook(book.id, {
      title: editTitle.trim() || book.title,
      author: editAuthor.trim() || book.author,
      year: editYear ? Number(editYear) : null,
      pages: editPages ? Number(editPages) : null,
      cover: editCover || book.cover || null,
    })
    setEditing(false)
  }

  const liveTotal   = Number(totalInput) || 0
  const livePage    = Math.min(liveTotal || Infinity, Math.max(0, Number(pageInput)))
  const livePercent = progressMode === MODES.percent
    ? Math.min(100, Math.max(0, Number(percentInput) || 0))
    : (liveTotal > 0 ? Math.round((livePage / liveTotal) * 100) : 0)

  function submitProgress(e) {
    e?.preventDefault()
    let pct, page, total
    if (progressMode === MODES.percent) {
      pct = Math.min(100, Math.max(0, Number(percentInput) || 0))
      page = 0; total = null
    } else {
      total = Number(totalInput) || null
      page  = total ? Math.min(total, Math.max(0, Number(pageInput))) : Math.max(0, Number(pageInput))
      pct   = total ? Math.round((page / total) * 100) : 0
    }
    const yearRead = pct === 100
      ? (yearInput ? Number(yearInput) : new Date().getFullYear())
      : null
    onUpdateProgress(book.id, pct, page, total, yearRead)
  }

  function saveReview() {
    onUpdateReview(book.id, review)
    setReviewSaved(true)
    setTimeout(() => setReviewSaved(false), 2000)
  }

  const inputCls = 'flex-1 min-w-0 text-xs border border-purple-200 rounded-lg px-2 py-1.5 outline-none text-center bg-white text-purple-800 font-semibold focus:ring-2 focus:ring-purple-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#1a0a3d]/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-purple-900/20 flex flex-col overflow-hidden max-h-[92vh]">

        {/* Header — capa + info */}
        <div className="flex gap-4 px-5 pt-5 pb-4 bg-gradient-to-br from-[#f3eeff] to-white border-b border-purple-100">
          {/* Capa */}
          <div className="flex-shrink-0 flex flex-col gap-1.5 items-center">
            <div
              className={`w-20 h-[120px] rounded-xl overflow-hidden shadow-md bg-purple-100 relative ${editing ? 'cursor-pointer group' : ''}`}
              onClick={() => editing && coverMode === 'upload' && fileInputRef.current?.click()}
            >
              {(editing ? editCover : book.cover) ? (
                <img
                  src={editing ? editCover : book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9b7ec8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
              )}
              {editing && coverMode === 'upload' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
              )}
            </div>
            {editing && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
                <div className="flex gap-0.5 bg-purple-100 rounded-lg p-0.5 w-20">
                  {[['upload', '📁'], ['url', '🔗']].map(([m, icon]) => (
                    <button
                      key={m} type="button" onClick={() => setCoverMode(m)}
                      className={`flex-1 text-[10px] py-0.5 rounded-md font-bold transition-all ${coverMode === m ? 'bg-white text-[#6b48b0] shadow-sm' : 'text-purple-400'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {coverMode === 'url' && (
                  <input
                    type="url"
                    value={editCover}
                    onChange={(e) => setEditCover(e.target.value)}
                    placeholder="URL da capa"
                    className="w-20 text-[9px] border border-purple-200 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-300 text-purple-700"
                  />
                )}
              </>
            )}
          </div>

          {/* Texto / Formulário de edição */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <form onSubmit={saveDetails} className="flex flex-col gap-1.5">
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título"
                  className="w-full text-sm font-bold text-[#3d1d80] bg-white border border-purple-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <input
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="Autor"
                  className="w-full text-sm text-purple-500 bg-white border border-purple-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder="Ano"
                    className="w-20 text-xs text-purple-400 bg-white border border-purple-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <input
                    type="number"
                    value={editPages}
                    onChange={(e) => setEditPages(e.target.value)}
                    placeholder="Páginas"
                    className="w-24 text-xs text-purple-400 bg-white border border-purple-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex gap-1.5 mt-0.5">
                  <button
                    type="submit"
                    className="flex-1 bg-[#6b48b0] hover:bg-[#7d57c8] text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-500 text-xs font-bold py-1.5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="font-bold text-[#3d1d80] text-base leading-tight line-clamp-2">{book.title}</p>
                <p className="text-purple-400 text-sm mt-0.5">{book.author}</p>
                <p className="text-purple-300 text-xs mt-1">
                  {[book.year, book.pages ? `${book.pages} pág.` : null].filter(Boolean).join(' · ')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={book.rating} onChange={(v) => onUpdateRating(book.id, v)} size="sm" />
                  <button
                    onClick={() => onToggleFavorite(book.id, !book.favorite)}
                    className={`transition-all ${book.favorite ? 'text-rose-500' : 'text-purple-200 hover:text-rose-400'}`}
                  >
                    <HeartIcon size={15} filled={book.favorite} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Botões topo direito */}
          <div className="flex flex-col gap-1 self-start">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-purple-300 hover:text-purple-600 transition-colors w-8 h-8 flex items-center justify-center rounded-xl hover:bg-purple-50"
                title="Editar informações"
              >
                <EditIcon size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-purple-600 transition-colors w-8 h-8 flex items-center justify-center rounded-xl hover:bg-purple-50"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Corpo com scroll */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

          {/* Formato */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-300 mb-2">Formato</p>
            <div className="flex gap-1 bg-purple-100/60 rounded-xl p-1">
              {[['physical', 'Físico'], ['ebook', 'Ebook']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => onUpdateFormat(book.id, book.format === val ? null : val)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${
                    book.format === val ? 'bg-white text-[#6b48b0] shadow-sm' : 'text-purple-400 hover:text-purple-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Progresso */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-300 mb-2">Progresso</p>
            <form onSubmit={submitProgress} className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-3 flex flex-col gap-2.5">
              {/* Seletor modo */}
              <div className="flex gap-0.5 bg-purple-200/50 rounded-lg p-0.5">
                {[['pages', 'Páginas'], ['percent', '% Ebook']].map(([m, label]) => (
                  <button
                    key={m} type="button" onClick={() => setProgressMode(m)}
                    className={`flex-1 text-[11px] font-bold py-1 rounded-md transition-all ${
                      progressMode === m ? 'bg-white text-[#6b48b0] shadow-sm' : 'text-purple-400 hover:text-purple-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Campos */}
              {progressMode === MODES.pages ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-purple-400 font-medium shrink-0">Pág.</span>
                  <input autoFocus type="number" min={0} placeholder="0" value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)} className={inputCls} />
                  <span className="text-xs text-purple-400 shrink-0">de</span>
                  <input type="number" min={1} placeholder="total" value={totalInput}
                    onChange={(e) => setTotalInput(e.target.value)} className={inputCls} />
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input autoFocus type="number" min={0} max={100} placeholder="0" value={percentInput}
                    onChange={(e) => setPercentInput(e.target.value)} className={inputCls} />
                  <span className="text-xs text-purple-400 font-medium shrink-0">%</span>
                </div>
              )}

              {/* Barra */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#9b7ec8] rounded-full transition-all duration-200" style={{ width: `${livePercent}%` }} />
                </div>
                <span className="text-xs font-bold text-[#6b48b0] shrink-0 w-9 text-right">{livePercent}%</span>
              </div>

              {/* Ano */}
              {livePercent === 100 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-400 font-medium shrink-0">Lido em</span>
                  <input type="number" min={1900} max={new Date().getFullYear() + 1}
                    placeholder={new Date().getFullYear()} value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)} className={inputCls} />
                </div>
              )}

              <button type="submit"
                className="w-full bg-[#6b48b0] hover:bg-[#7d57c8] text-white text-sm font-bold py-2 rounded-xl transition-colors"
              >
                Salvar progresso
              </button>
            </form>
          </div>

          {/* Resenha */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-300 mb-2">Minha resenha</p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Escreva suas impressões, pontos favoritos, notas..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-purple-900 placeholder:text-purple-300 resize-none bg-white"
            />
            <button
              onClick={saveReview}
              className={`mt-2 w-full text-sm font-bold py-2 rounded-xl transition-all ${
                reviewSaved
                  ? 'bg-green-100 text-green-600'
                  : 'bg-purple-100 hover:bg-purple-200 text-[#6b48b0]'
              }`}
            >
              {reviewSaved ? '✓ Resenha salva!' : 'Salvar resenha'}
            </button>
          </div>

          {/* Remover */}
          <button
            onClick={() => { onDelete(book.id); onClose() }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 text-sm font-semibold transition-colors"
          >
            <TrashIcon size={15} />
            Remover da estante
          </button>
        </div>
      </div>
    </div>
  )
}
