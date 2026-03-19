import BookCard from './BookCard'
import EmptyShelf from './EmptyShelf'
import { BookIcon } from './Icons'

function groupByYear(books) {
  const groups = {}
  books.forEach((book) => {
    const key = book.yearRead ?? 'Sem ano'
    if (!groups[key]) groups[key] = []
    groups[key].push(book)
  })
  return Object.entries(groups).sort(([a], [b]) => {
    if (a === 'Sem ano') return 1
    if (b === 'Sem ano') return -1
    return Number(b) - Number(a)
  })
}

export default function BookGrid({ books, filtered, search, tabLabel, activeTab, onAdd, onDelete, onUpdateRating, onUpdateProgress }) {
  if (books.length === 0) return <EmptyShelf onAdd={onAdd} />

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <BookIcon size={48} className="text-purple-200 mb-4" />
        <h2 className="text-xl font-bold text-purple-700 mb-2">Nenhum livro encontrado</h2>
        <p className="text-purple-400 text-sm">Tente outro título ou autor.</p>
      </div>
    )
  }

  const cardProps = { onDelete, onUpdateRating, onUpdateProgress }
  const showGrouped = activeTab === 'finished' && !search

  return (
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

      {showGrouped ? (
        <div className="flex flex-col gap-10">
          {groupByYear(filtered).map(([year, booksInYear]) => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-base font-bold text-[#3d1d80]">{year}</span>
                <div className="flex-1 h-px bg-purple-100" />
                <span className="text-xs text-purple-400 font-medium">
                  {booksInYear.length} {booksInYear.length === 1 ? 'livro' : 'livros'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-5 gap-y-8">
                {booksInYear.map((book) => (
                  <BookCard key={book.id} book={book} {...cardProps} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-5 gap-y-8">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} {...cardProps} />
          ))}
        </div>
      )}
    </>
  )
}
