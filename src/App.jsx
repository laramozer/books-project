import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import BookCard from './components/BookCard'
import SearchModal from './components/SearchModal'
import { db, addBook, deleteBook, updateBook, bookExists } from './db'
import {
  BookIcon, BookOpenIcon, CheckCircleIcon, HomeIcon,
  SearchIcon, PlusIcon, LayersIcon,
} from './components/Icons'

export default function App() {
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const books = useLiveQuery(() => db.books.orderBy('createdAt').reverse().toArray(), [])

  if (!books) return <LoadingScreen />

  const reading = books.filter((b) => (b.progress ?? 0) > 0 && (b.progress ?? 0) < 100)
  const finished = books.filter((b) => (b.progress ?? 0) === 100)

  const tabBooks = activeTab === 'reading' ? reading : activeTab === 'finished' ? finished : books

  const filtered = tabBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddBook(book) {
    const exists = await bookExists(book.googleId)
    if (!exists) await addBook({ ...book, id: crypto.randomUUID(), rating: 0, progress: 0 })
  }

  const navItems = [
    { id: 'all', label: 'Todos', icon: HomeIcon, count: books.length },
    { id: 'reading', label: 'Lendo', icon: BookOpenIcon, count: reading.length },
    { id: 'finished', label: 'Concluídos', icon: CheckCircleIcon, count: finished.length },
  ]

  const tabLabel = navItems.find((n) => n.id === activeTab)?.label

  return (
    <div className="min-h-screen bg-[#f3eeff] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-purple-100 fixed top-0 left-0 z-50">
        <div className="px-6 py-7 flex items-center gap-3 border-b border-purple-100">
          <div className="w-9 h-9 rounded-xl bg-[#ede8ff] flex items-center justify-center">
            <LayersIcon size={20} className="text-[#6b48b0]" />
          </div>
          <div>
            <p className="text-[#3d1d80] font-bold text-base leading-tight">Minha Estante</p>
            <p className="text-purple-400 text-xs">{books.length} {books.length === 1 ? 'livro' : 'livros'}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-6 flex-1">
          <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Biblioteca</p>
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${
                activeTab === id
                  ? 'bg-[#ede8ff] text-[#6b48b0]'
                  : 'text-purple-400 hover:bg-purple-50 hover:text-[#6b48b0]'
              }`}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === id ? 'bg-[#6b48b0] text-white' : 'bg-purple-100 text-purple-400'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </nav>

        <div className="px-4 pb-8">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-purple-200"
          >
            <PlusIcon size={16} />
            Adicionar livro
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-[#f3eeff]/90 backdrop-blur-md border-b border-purple-100">
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="flex items-center gap-2.5 lg:hidden mr-auto">
              <div className="w-8 h-8 rounded-xl bg-[#ede8ff] flex items-center justify-center">
                <LayersIcon size={16} className="text-[#6b48b0]" />
              </div>
              <span className="font-bold text-[#3d1d80]">Minha Estante</span>
            </div>

            <div className="relative hidden lg:flex items-center mr-auto">
              <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar na estante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm w-72 bg-white text-purple-900 placeholder:text-purple-300 shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowSearch(true)}
              className="lg:hidden ml-auto bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5"
            >
              <PlusIcon size={14} />
              Adicionar
            </button>
          </div>

          <div className="lg:hidden px-6 pb-3">
            <div className="relative flex items-center">
              <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar na estante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white text-purple-900 placeholder:text-purple-300 shadow-sm"
              />
            </div>
          </div>

          <div className="lg:hidden flex gap-1 px-6 pb-3">
            {navItems.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-[#6b48b0] text-white'
                    : 'bg-white text-purple-400 border border-purple-100'
                }`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === id ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-400'
                }`}>{count}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-8">
          {books.length === 0 ? (
            <Empty onAdd={() => setShowSearch(true)} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <BookIcon size={48} className="text-purple-200 mb-4" />
              <h2 className="text-xl font-bold text-purple-700 mb-2">Nenhum livro encontrado</h2>
              <p className="text-purple-400 text-sm">Tente outro título ou autor.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-xl font-bold text-[#3d1d80]">
                    {search ? `"${search}"` : tabLabel}
                  </h2>
                  <p className="text-purple-400 text-sm mt-0.5">
                    {filtered.length} {filtered.length === 1 ? 'livro' : 'livros'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-5 gap-y-8">
                {filtered.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onDelete={deleteBook}
                    onUpdateRating={(id, rating) => updateBook(id, { rating })}
                    onUpdateProgress={(id, progress, currentPage, totalPages) => {
                      updateBook(id, { progress, currentPage: currentPage ?? 0, pages: totalPages ?? null })
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {showSearch && (
        <SearchModal onAdd={handleAddBook} onClose={() => setShowSearch(false)} />
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f3eeff] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-[#6b48b0] rounded-full animate-spin" />
        <p className="text-purple-400 text-sm font-medium">Carregando sua estante...</p>
      </div>
    </div>
  )
}

function Empty({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-40 text-center">
      <div className="w-24 h-24 rounded-3xl bg-purple-100 flex items-center justify-center mb-6">
        <BookIcon size={44} className="text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-[#3d1d80] mb-2">Sua estante está vazia</h2>
      <p className="text-purple-400 mb-8 max-w-xs text-sm leading-relaxed">
        Busque por títulos ou autores e adicione os livros que você leu ou quer ler.
      </p>
      <button
        onClick={onAdd}
        className="bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-150 shadow-lg shadow-purple-200 flex items-center gap-2"
      >
        <PlusIcon size={16} />
        Buscar livros
      </button>
    </div>
  )
}
