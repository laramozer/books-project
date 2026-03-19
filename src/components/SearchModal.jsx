import { useState, useCallback, useEffect } from 'react'
import { SearchIcon, PlusIcon, CloseIcon, BookIcon, EditIcon } from './Icons'
import { addToCatalog, searchCatalog } from '../db'

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

async function fetchBooks(query) {
  if (!query.trim()) return []

  // Busca na Open Library priorizando português
  const params = new URLSearchParams({
    q: query,
    language: 'por',
    limit: '15',
    fields: 'key,title,author_name,cover_i,first_publish_year,number_of_pages_median',
  })

  const res = await fetch(`https://openlibrary.org/search.json?${params}`)
  const data = await res.json()
  const docs = data.docs || []

  // Se não achou nada em português, busca sem restrição de idioma
  if (docs.length === 0) {
    const fallbackParams = new URLSearchParams({
      q: query,
      limit: '12',
      fields: 'key,title,author_name,cover_i,first_publish_year,number_of_pages_median',
    })
    const fallbackRes = await fetch(`https://openlibrary.org/search.json?${fallbackParams}`)
    const fallbackData = await fallbackRes.json()
    return mapDocs(fallbackData.docs || [])
  }

  return mapDocs(docs)
}

function mapDocs(docs) {
  return docs.map((doc) => ({
    googleId: doc.key,
    title: doc.title || 'Sem título',
    author: (doc.author_name || ['Autor desconhecido']).slice(0, 2).join(', '),
    cover: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : null,
    year: doc.first_publish_year?.toString() || '',
    pages: doc.number_of_pages_median || null,
  }))
}

const EMPTY_MANUAL = { title: '', author: '', year: '', pages: '', cover: '' }

export default function SearchModal({ onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(new Set())
  const [manualMode, setManualMode] = useState(false)
  const [manual, setManual] = useState(EMPTY_MANUAL)
  const [manualDone, setManualDone] = useState(false)
  const [catalogResults, setCatalogResults] = useState([])

  const search = useCallback(
    debounce(async (q) => {
      if (!q.trim()) { setResults([]); return }
      setLoading(true)
      setError(null)
      try {
        const books = await fetchBooks(q)
        setResults(books)
      } catch {
        setError('Erro ao buscar livros. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    searchCatalog(query).then(setCatalogResults)
  }, [query])

  function handleChange(e) {
    setQuery(e.target.value)
    search(e.target.value)
  }

  function handleAdd(book) {
    onAdd({ ...book, id: crypto.randomUUID(), rating: 0, progress: 0 })
    setAdded((prev) => new Set([...prev, book.googleId]))
  }

  function handleManualChange(e) {
    setManual((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleManualSubmit(e) {
    e.preventDefault()
    if (!manual.title.trim()) return
    const book = {
      googleId: `manual-${crypto.randomUUID()}`,
      title: manual.title.trim(),
      author: manual.author.trim() || 'Autor desconhecido',
      year: manual.year.trim(),
      pages: manual.pages ? Number(manual.pages) : null,
      cover: manual.cover.trim() || null,
    }
    await addToCatalog(book)
    onAdd({ ...book, rating: 0, progress: 0 })
    setManualDone(true)
  }

  function openManual() {
    setManual(EMPTY_MANUAL)
    setManualDone(false)
    setManualMode(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1a0a3d]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-purple-900/20 w-full max-w-2xl flex flex-col overflow-hidden max-h-[88vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-purple-100 bg-gradient-to-br from-[#f3eeff] to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6b48b0] flex items-center justify-center">
                {manualMode ? <EditIcon size={18} className="text-white" /> : <BookIcon size={18} className="text-white" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3d1d80]">
                  {manualMode ? 'Cadastro manual' : 'Adicionar livro'}
                </h2>
                <p className="text-xs text-purple-400">
                  {manualMode ? 'Preencha os dados do livro' : 'Busca via Open Library'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!manualMode && (
                <button
                  onClick={openManual}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 hover:text-[#6b48b0] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  <EditIcon size={13} />
                  Manual
                </button>
              )}
              {manualMode && (
                <button
                  onClick={() => setManualMode(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 hover:text-[#6b48b0] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  <SearchIcon size={13} />
                  Buscar
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

          {!manualMode && (
            <div className="relative flex items-center">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar por título, autor ou ISBN..."
                value={query}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white text-purple-900 placeholder:text-purple-300 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* Modo manual */}
          {manualMode && (
            manualDone ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                  <BookIcon size={28} className="text-[#6b48b0]" />
                </div>
                <p className="font-bold text-[#3d1d80] text-base mb-1">Livro adicionado!</p>
                <p className="text-purple-400 text-sm mb-6">O livro foi salvo na sua estante.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setManualDone(false); setManual(EMPTY_MANUAL) }}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                  >
                    Adicionar outro
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-[#6b48b0] hover:bg-[#7d57c8] text-white transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-purple-500">Título <span className="text-purple-400 font-normal">(obrigatório)</span></label>
                  <input
                    autoFocus
                    name="title"
                    value={manual.title}
                    onChange={handleManualChange}
                    placeholder="Ex: O Senhor dos Anéis"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-purple-900 placeholder:text-purple-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-purple-500">Autor</label>
                  <input
                    name="author"
                    value={manual.author}
                    onChange={handleManualChange}
                    placeholder="Ex: J.R.R. Tolkien"
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-purple-900 placeholder:text-purple-300"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-semibold text-purple-500">Ano</label>
                    <input
                      name="year"
                      value={manual.year}
                      onChange={handleManualChange}
                      placeholder="Ex: 1954"
                      type="number"
                      min={0}
                      className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-purple-900 placeholder:text-purple-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-semibold text-purple-500">Páginas</label>
                    <input
                      name="pages"
                      value={manual.pages}
                      onChange={handleManualChange}
                      placeholder="Ex: 576"
                      type="number"
                      min={1}
                      className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-purple-900 placeholder:text-purple-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-purple-500">URL da capa <span className="text-purple-400 font-normal">(opcional)</span></label>
                  <input
                    name="cover"
                    value={manual.cover}
                    onChange={handleManualChange}
                    placeholder="https://..."
                    type="url"
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-purple-900 placeholder:text-purple-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manual.title.trim()}
                  className="w-full mt-1 bg-[#6b48b0] hover:bg-[#7d57c8] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <PlusIcon size={15} />
                  Adicionar à estante
                </button>
              </form>
            )
          )}

          {/* Modo busca */}
          {!manualMode && (
            <>
              {loading && (
                <div className="flex justify-center items-center py-16">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-[#6b48b0] rounded-full animate-spin" />
                </div>
              )}

              {error && (
                <p className="text-center text-red-400 py-8 text-sm">{error}</p>
              )}

              {!loading && !error && results.length === 0 && query.trim() && (
                <div className="flex flex-col items-center py-12 text-purple-300">
                  <BookIcon size={40} className="mb-3 text-purple-200" />
                  <p className="font-semibold text-purple-500">Nenhum livro encontrado</p>
                  <p className="text-sm mt-1 text-purple-300 mb-6">Tente buscar por outro termo</p>
                  <button
                    onClick={openManual}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                  >
                    <EditIcon size={14} />
                    Cadastrar manualmente
                  </button>
                </div>
              )}

              {!loading && !error && results.length === 0 && !query.trim() && (
                <div className="flex flex-col items-center py-16 text-purple-300">
                  <SearchIcon size={40} className="mb-3 text-purple-200" />
                  <p className="font-semibold text-purple-500">Digite para buscar livros</p>
                </div>
              )}

              {!loading && catalogResults.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-300 px-1 mb-1.5">
                    Meus cadastros
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {catalogResults.map((book) => (
                      <div
                        key={book.googleId}
                        className="flex items-center gap-4 py-3 px-3 hover:bg-[#f3eeff] rounded-xl transition-colors"
                      >
                        <div className="w-11 h-16 rounded-lg overflow-hidden bg-purple-100 flex-shrink-0 shadow-sm">
                          {book.cover ? (
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookIcon size={18} className="text-purple-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#3d1d80] text-sm leading-tight line-clamp-2">{book.title}</p>
                          <p className="text-purple-500 text-xs mt-0.5 font-medium">{book.author}</p>
                          <p className="text-purple-300 text-xs mt-0.5">
                            {[book.year, book.pages ? `${book.pages} pág.` : null].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAdd(book)}
                          disabled={added.has(book.googleId)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            added.has(book.googleId)
                              ? 'bg-purple-100 text-purple-400 cursor-default'
                              : 'bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white shadow-sm shadow-purple-200'
                          }`}
                        >
                          {added.has(book.googleId) ? '✓ Adicionado' : <><PlusIcon size={12} />Adicionar</>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div>
                  {catalogResults.length > 0 && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-300 px-1 mb-1.5">
                      Open Library
                    </p>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {results.map((book) => (
                      <div
                        key={book.googleId}
                        className="flex items-center gap-4 py-3 px-3 hover:bg-[#f3eeff] rounded-xl transition-colors group"
                      >
                        <div className="w-11 h-16 rounded-lg overflow-hidden bg-purple-100 flex-shrink-0 shadow-sm">
                          {book.cover ? (
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookIcon size={18} className="text-purple-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#3d1d80] text-sm leading-tight line-clamp-2">{book.title}</p>
                          <p className="text-purple-500 text-xs mt-0.5 font-medium">{book.author}</p>
                          <p className="text-purple-300 text-xs mt-0.5">
                            {[book.year, book.pages ? `${book.pages} pág.` : null].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAdd(book)}
                          disabled={added.has(book.googleId)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            added.has(book.googleId)
                              ? 'bg-purple-100 text-purple-400 cursor-default'
                              : 'bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white shadow-sm shadow-purple-200'
                          }`}
                        >
                          {added.has(book.googleId) ? (
                            '✓ Adicionado'
                          ) : (
                            <>
                              <PlusIcon size={12} />
                              Adicionar
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
