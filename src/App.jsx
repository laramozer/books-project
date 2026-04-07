import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addBook, deleteBook, updateBook, bookExists } from './db'
import { getToken, saveBackup } from './backup'
import { BookOpenIcon, CheckCircleIcon, HomeIcon, BookmarkIcon, HeartIcon, PhysicalBookIcon, EbookIcon, TargetIcon } from './components/Icons'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import BookGrid from './components/BookGrid'
import GoalsView from './components/GoalsView'
import SearchModal from './components/SearchModal'
import BackupModal from './components/BackupModal'
import LoadingScreen from './components/LoadingScreen'

export default function App() {
  const [showSearch, setShowSearch]   = useState(false)
  const [showBackup, setShowBackup]   = useState(false)
  const [search, setSearch]           = useState('')
  const [activeTab, setActiveTab]     = useState('all')
  const [backupStatus, setBackupStatus] = useState(null)
  const backupTimer = useRef(null)

  const books = useLiveQuery(() => db.books.orderBy('createdAt').reverse().toArray(), [])

  useEffect(() => {
    if (!books || !getToken()) return
    clearTimeout(backupTimer.current)
    backupTimer.current = setTimeout(async () => {
      try {
        setBackupStatus('saving')
        await saveBackup(books)
        setBackupStatus('saved')
        setTimeout(() => setBackupStatus(null), 3000)
      } catch {
        setBackupStatus('error')
        setTimeout(() => setBackupStatus(null), 4000)
      }
    }, 4000)
    return () => clearTimeout(backupTimer.current)
  }, [books])

  if (!books) return <LoadingScreen />

  const favorites = books.filter((b) => b.favorite)
  const wishlist  = books.filter((b) => (b.progress ?? 0) === 0)
  const reading   = books.filter((b) => (b.progress ?? 0) > 0 && (b.progress ?? 0) < 100)
  const finished  = books.filter((b) => (b.progress ?? 0) === 100)
  const physical  = books.filter((b) => b.format === 'physical')
  const ebooks    = books.filter((b) => b.format === 'ebook')

  const tabBooks =
    activeTab === 'favorites' ? favorites :
    activeTab === 'wishlist'  ? wishlist  :
    activeTab === 'reading'   ? reading   :
    activeTab === 'finished'  ? finished  :
    activeTab === 'physical'  ? physical  :
    activeTab === 'ebook'     ? ebooks    : books

  const filtered = tabBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  )

  const mainNavItems = [
    { id: 'all',       label: 'Todos',      icon: HomeIcon,        count: books.length     },
    { id: 'favorites', label: 'Favoritos',  icon: HeartIcon,       count: favorites.length },
    { id: 'wishlist',  label: 'Não lidos',  icon: BookmarkIcon,    count: wishlist.length  },
    { id: 'reading',   label: 'Lendo',      icon: BookOpenIcon,    count: reading.length   },
    { id: 'finished',  label: 'Concluídos', icon: CheckCircleIcon, count: finished.length  },
  ]

  const formatNavItems = [
    { id: 'physical', label: 'Físicos', icon: PhysicalBookIcon, count: physical.length },
    { id: 'ebook',    label: 'Ebooks',  icon: EbookIcon,        count: ebooks.length   },
  ]

  const goalsNavItem = { id: 'goals', label: 'Metas', icon: TargetIcon }

  const navItems = [...mainNavItems, ...formatNavItems]

  const tabLabel = navItems.find((n) => n.id === activeTab)?.label

  async function handleAddBook(book) {
    const exists = await bookExists(book.googleId)
    if (!exists) await addBook({ rating: 0, progress: 0, currentPage: 0, ...book, id: crypto.randomUUID() })
  }

  function handleUpdateProgress(id, progress, currentPage, totalPages, yearRead) {
    const book = books.find((b) => b.id === id)
    const changes = { progress, currentPage: currentPage ?? 0, pages: totalPages ?? null, yearRead: yearRead ?? null }
    if (progress === 100 && !book?.finishedAt) changes.finishedAt = Date.now()
    updateBook(id, changes)
  }

  return (
    <div className="min-h-screen bg-[#f3eeff] flex">
      <Sidebar
        mainNavItems={mainNavItems}
        formatNavItems={formatNavItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAdd={() => setShowSearch(true)}
        onOpenBackup={() => setShowBackup(true)}
        totalBooks={books.length}
        backupStatus={backupStatus}
        goalsNavItem={goalsNavItem}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Topbar
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          onAdd={() => setShowSearch(true)}
          goalsNavItem={goalsNavItem}
        />

        <main className="flex-1 px-6 py-8">
          {activeTab === 'goals' ? (
            <GoalsView books={books} />
          ) : (
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
              onToggleFavorite={(id, val) => updateBook(id, { favorite: val })}
              onUpdateFormat={(id, val) => updateBook(id, { format: val ?? null })}
              onUpdateReview={(id, review) => updateBook(id, { review: review ?? null })}
              onUpdateBook={(id, changes) => updateBook(id, changes)}
            />
          )}
        </main>
      </div>

      {showSearch && (
        <SearchModal onAdd={handleAddBook} onClose={() => setShowSearch(false)} />
      )}
      {showBackup && (
        <BackupModal onClose={() => setShowBackup(false)} />
      )}
    </div>
  )
}
