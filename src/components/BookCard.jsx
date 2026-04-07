import { useState } from 'react'
import StarRating from './StarRating'
import { HeartIcon } from './Icons'
import BookDetailModal from './BookDetailModal'

export default function BookCard({ book, onDelete, onUpdateRating, onUpdateProgress, onToggleFavorite, onUpdateFormat, onUpdateReview, onUpdateBook }) {
  const [showDetail, setShowDetail] = useState(false)

  const progress = book.pages && book.pages > 0
    ? Math.round(((book.currentPage ?? 0) / book.pages) * 100)
    : (book.progress ?? 0)

  const progressLabel = progress === 100
    ? (book.yearRead ? String(book.yearRead) : '✓')
    : progress > 0
      ? `${progress}%`
      : null

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {/* Capa */}
        <div
          onClick={() => setShowDetail(true)}
          className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md bg-purple-100 group cursor-pointer"
        >
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 gap-2 p-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9b7ec8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="text-[9px] text-center text-purple-400 font-medium leading-tight line-clamp-3">{book.title}</p>
            </div>
          )}

          {/* Favorito */}
          {book.favorite && (
            <div className="absolute top-1.5 right-1.5 bg-white/90 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              <HeartIcon size={11} filled className="text-rose-500" />
            </div>
          )}

          {/* Barra de progresso */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10">
              <div
                className="h-full bg-[#c4a8e8] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Estrelas + porcentagem */}
        <div className="flex items-center gap-1 px-0.5">
          <div className="flex-1 min-w-0">
            <StarRating
              value={book.rating}
              onChange={(v) => onUpdateRating(book.id, v)}
              size="sm"
            />
          </div>
          {progressLabel && (
            <span className="text-[10px] font-bold text-purple-400 shrink-0">{progressLabel}</span>
          )}
        </div>
      </div>

      {showDetail && (
        <BookDetailModal
          book={book}
          onClose={() => setShowDetail(false)}
          onDelete={onDelete}
          onUpdateRating={onUpdateRating}
          onUpdateProgress={onUpdateProgress}
          onToggleFavorite={onToggleFavorite}
          onUpdateFormat={onUpdateFormat}
          onUpdateReview={onUpdateReview}
          onUpdateBook={onUpdateBook}
        />
      )}
    </>
  )
}
