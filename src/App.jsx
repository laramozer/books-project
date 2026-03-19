import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addBook, deleteBook, updateBook, bookExists } from './db'
import { BookOpenIcon, CheckCircleIcon, HomeIcon, BookmarkIcon } from './components/Icons'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import BookGrid from './components/BookGrid'
import SearchModal from './components/SearchModal'
import LoadingScreen from './components/LoadingScreen'

export default function App() {
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const books = useLiveQuery(() => db.books.orderBy('createdAt').reverse().toArray(), [])

  if (!books) return <LoadingScreen />

  const wishlist = books.filter((b) => (b.progress ?? 0) === 0)
  const reading  = books.filter((b) => (b.progress ?? 0) > 0 && (b.progress ?? 0) < 100)
  const finished = books.filter((b) => (b.progress ?? 0) === 100)

  const tabBooks =
    activeTab === 'wishlist' ? wishlist :
    activeTab === 'reading'  ? reading  :
    activeTab === 'finished' ? finished : books

  const filtered = tabBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  )

  const navItems = [
    { id: 'all',      label: 'Todos',      icon: HomeIcon,        count: books.length    },
    { id: 'wishlist', label: 'Não lidos',  icon: BookmarkIcon,    count: wishlist.length },
    { id: 'reading',  label: 'Lendo',      icon: BookOpenIcon,    count: reading.length  },
    { id: 'finished', label: 'Concluídos', icon: CheckCircleIcon, count: finished.length },
  ]

  const tabLabel = navItems.find((n) => n.id === activeTab)?.label

  async function handleAddBook(book) {
    const exists = await bookExists(book.googleId)
    if (!exists) await addBook({ ...book, id: crypto.randomUUID(), rating: 0, progress: 0 })
  }

  function handleUpdateProgress(id, progress, currentPage, totalPages, yearRead) {
    updateBook(id, { progress, currentPage: currentPage ?? 0, pages: totalPages ?? null, yearRead: yearRead ?? null })
  }

  return (
    <div className="min-h-screen bg-[#f3eeff] flex">
      <Sidebar
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAdd={() => setShowSearch(true)}
        totalBooks={books.length}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Topbar
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          onAdd={() => setShowSearch(true)}
        />

        <main className="flex-1 px-6 py-8">
          <BookGrid
            books={books}
            filtered={filtered}
            search={search}
            tabLabel={tabLabel}
            activeTab={activeTab}
            onAdd={() => setShowSearch(true)}
            onDelete={deleteBook}
            onUpdateRating={(id, rating) => updateBook(id, { rating })}
            onUpdateProgress={handleUpdateProgress}
          />
        </main>
      </div>

      {showSearch && (
        <SearchModal onAdd={handleAddBook} onClose={() => setShowSearch(false)} />
      )}
    </div>
  )
}
