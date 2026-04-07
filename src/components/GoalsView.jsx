import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, setGoal, deleteGoal, addBookToGoal, removeBookFromGoal } from '../db'
import { TargetIcon, CheckCircleIcon, PlusIcon, TrashIcon, SearchIcon, CloseIcon } from './Icons'

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(key) {
  const [year, month] = key.split('-')
  return `${MONTHS_PT[parseInt(month) - 1]} ${year}`
}

function BookPicker({ books, goalBookIds, month, onClose }) {
  const [search, setSearch] = useState('')

  const available = books.filter(
    (b) =>
      !goalBookIds.has(b.id) &&
      (b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="mt-3 border border-purple-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-purple-100">
        <SearchIcon size={14} className="text-purple-300 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          placeholder="Buscar livro da estante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm text-purple-900 placeholder:text-purple-300 outline-none bg-transparent"
        />
        <button onClick={onClose} className="text-purple-300 hover:text-purple-500 transition-colors">
          <CloseIcon size={14} />
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto">
        {available.length === 0 ? (
          <p className="text-center text-xs text-purple-300 py-6">
            {search ? 'Nenhum livro encontrado' : 'Todos os livros já foram adicionados'}
          </p>
        ) : (
          available.map((b) => (
            <button
              key={b.id}
              onClick={() => addBookToGoal(month, b.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 transition-colors text-left border-b border-purple-50 last:border-0"
            >
              {b.cover ? (
                <img src={b.cover} alt="" className="w-20 h-28 object-contain rounded-lg flex-shrink-0 shadow-sm" />
              ) : (
                <div className="w-20 h-28 rounded-lg bg-purple-100 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3d1d80] truncate">{b.title}</p>
                <p className="text-xs text-purple-400 truncate">{b.author}</p>
              </div>
              <PlusIcon size={14} className="text-purple-300 flex-shrink-0 ml-auto" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function PlannedBookRow({ book, isFinished, month }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
      isFinished
        ? 'bg-green-50 border-green-200'
        : 'bg-white/60 border-purple-100'
    }`}>
      {book.cover ? (
        <img src={book.cover} alt="" className="w-20 h-28 object-contain rounded-lg flex-shrink-0 shadow-sm" />
      ) : (
        <div className="w-20 h-28 rounded-lg bg-purple-100 flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isFinished ? 'text-green-800' : 'text-[#3d1d80]'}`}>
          {book.title}
        </p>
        <p className={`text-xs truncate ${isFinished ? 'text-green-600' : 'text-purple-400'}`}>
          {book.author}
        </p>
      </div>
      {isFinished ? (
        <CheckCircleIcon size={16} className="text-green-500 flex-shrink-0" />
      ) : (
        <span className="text-[10px] font-semibold text-purple-400 bg-purple-100 px-2 py-0.5 rounded-full flex-shrink-0">
          {book.progress > 0 ? `${book.progress}%` : 'Não iniciado'}
        </span>
      )}
      <button
        onClick={() => removeBookFromGoal(month, book.id)}
        className="text-purple-200 hover:text-red-400 transition-colors flex-shrink-0 ml-1"
        title="Remover da meta"
      >
        <CloseIcon size={13} />
      </button>
    </div>
  )
}

function MonthCard({ monthKey, goal, plannedBooks, allBooks, isCurrentMonth, onDeleteGoal }) {
  const [showPicker, setShowPicker] = useState(false)

  const plannedWithData = plannedBooks
    .map((gb) => allBooks.find((b) => b.id === gb.bookId))
    .filter(Boolean)

  const finishedCount = plannedWithData.filter((b) => b.progress === 100).length
  const total = plannedWithData.length > 0 ? plannedWithData.length : (goal?.target ?? 0)

  // finished this month via finishedAt (for books not in plan)
  const finishedThisMonth = allBooks.filter((b) => {
    if (b.progress !== 100 || !b.finishedAt) return false
    const d = new Date(b.finishedAt)
    const bm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return bm === monthKey
  })

  // If there are planned books, progress = finished planned / total planned
  // If no planned books, progress = finishedThisMonth / numeric target
  const completed = plannedWithData.length > 0 ? finishedCount : finishedThisMonth.length
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
  const done = total > 0 && completed >= total

  const goalBookIds = new Set(plannedBooks.map((gb) => gb.bookId))

  return (
    <div className={`rounded-2xl border p-4 ${isCurrentMonth ? 'bg-white border-purple-200 shadow-sm' : 'bg-white/60 border-purple-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`font-semibold text-sm ${isCurrentMonth ? 'text-[#3d1d80]' : 'text-purple-700'}`}>
            {formatMonth(monthKey)}
          </p>
          <p className="text-xs text-purple-400 mt-0.5">
            {completed} de {total} {total === 1 ? 'livro' : 'livros'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {done && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <CheckCircleIcon size={12} /> Meta atingida!
            </span>
          )}
          {!isCurrentMonth && (
            <button
              onClick={() => onDeleteGoal(monthKey)}
              className="text-purple-300 hover:text-red-400 transition-colors"
              title="Remover meta"
            >
              <TrashIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      {total > 0 && (
        <>
          <div className="h-2.5 bg-purple-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-400' : 'bg-[#6b48b0]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-right text-xs text-purple-400 mt-1">{pct}%</p>
        </>
      )}

      {/* Lista de livros planejados */}
      {plannedWithData.length > 0 && (
        <div className="flex flex-col gap-2 mt-3">
          {plannedWithData.map((b) => (
            <PlannedBookRow key={b.id} book={b} isFinished={b.progress === 100} month={monthKey} />
          ))}
        </div>
      )}

      {/* Livros concluídos no mês (apenas se não houver planejados) */}
      {plannedWithData.length === 0 && finishedThisMonth.length > 0 && isCurrentMonth && (
        <div className="mt-3">
          <p className="text-purple-400 text-xs font-medium mb-2">Concluídos este mês</p>
          <div className="flex flex-col gap-2">
            {finishedThisMonth.map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                {b.cover && <img src={b.cover} alt="" className="w-20 h-28 object-contain rounded-lg flex-shrink-0 shadow-sm" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-800 truncate">{b.title}</p>
                  <p className="text-xs text-green-600 truncate">{b.author}</p>
                </div>
                <CheckCircleIcon size={16} className="text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão adicionar livro */}
      {isCurrentMonth && (
        <div className="mt-3">
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-purple-500 hover:text-[#6b48b0] transition-colors"
          >
            <PlusIcon size={13} />
            Adicionar livro à meta
          </button>
          {showPicker && (
            <BookPicker
              books={allBooks}
              goalBookIds={goalBookIds}
              month={monthKey}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default function GoalsView({ books }) {
  const [newTarget, setNewTarget] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [showAddForm, setShowAddForm] = useState(false)

  const goals = useLiveQuery(() => db.goals.orderBy('month').reverse().toArray(), [])
  const goalBooks = useLiveQuery(() => db.goalBooks.toArray(), [])

  const currentMonth = getCurrentMonth()
  const currentGoal = goals?.find((g) => g.month === currentMonth)
  const currentGoalBooks = goalBooks?.filter((gb) => gb.month === currentMonth) ?? []

  // Ensure there's always a card for current month if there are planned books but no goal record
  const hasCurrentMonthContent = currentGoal || currentGoalBooks.length > 0

  async function handleSave() {
    const n = parseInt(newTarget)
    if (!n || n < 1) return
    await setGoal(selectedMonth, n)
    setNewTarget('')
    setShowAddForm(false)
  }

  async function handleDelete(month) {
    await deleteGoal(month)
  }

  function getMonthOptions() {
    const opts = []
    const now = new Date()
    for (let i = -1; i <= 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      opts.push(key)
    }
    return opts
  }

  const pastGoals = goals?.filter((g) => g.month !== currentMonth) ?? []

  return (
    <div className="max-w-xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ede8ff] flex items-center justify-center">
            <TargetIcon size={20} className="text-[#6b48b0]" />
          </div>
          <div>
            <h1 className="text-[#3d1d80] font-bold text-lg leading-tight">Metas de Leitura</h1>
            <p className="text-purple-400 text-xs">Acompanhe seus objetivos mensais</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-purple-200"
        >
          <PlusIcon size={14} />
          Nova meta
        </button>
      </div>

      {/* Formulário nova meta */}
      {showAddForm && (
        <div className="bg-white border border-purple-200 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-sm font-semibold text-[#3d1d80] mb-4">Definir meta numérica</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-purple-500 font-medium mb-1 block">Mês</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                {getMonthOptions().map((m) => (
                  <option key={m} value={m}>{formatMonth(m)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-purple-500 font-medium mb-1 block">Quantos livros?</label>
              <input
                type="number"
                min="1"
                max="99"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Ex: 4"
                className="w-full border border-purple-200 rounded-xl px-3 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-purple-300"
              />
            </div>
            <p className="text-xs text-purple-400">
              Você também pode adicionar livros específicos diretamente no card do mês.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!newTarget || parseInt(newTarget) < 1}
                className="flex-1 bg-[#6b48b0] hover:bg-[#7d57c8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
              >
                Salvar meta
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewTarget('') }}
                className="px-4 py-2.5 rounded-xl border border-purple-200 text-purple-500 text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mês atual */}
      <div className="mb-4">
        <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest mb-3">Mês atual</p>
        {hasCurrentMonthContent ? (
          <MonthCard
            monthKey={currentMonth}
            goal={currentGoal}
            plannedBooks={currentGoalBooks}
            allBooks={books}
            isCurrentMonth
            onDeleteGoal={handleDelete}
          />
        ) : (
          <div className="bg-white border border-dashed border-purple-200 rounded-2xl p-6">
            <div className="text-center mb-4">
              <TargetIcon size={32} className="text-purple-200 mx-auto mb-2" />
              <p className="text-purple-400 text-sm font-medium">Nenhuma meta para {formatMonth(currentMonth)}</p>
              <p className="text-purple-300 text-xs mt-1">Defina uma meta numérica ou adicione livros específicos</p>
            </div>
            {/* Quick add books inline */}
            <AddBooksInline books={books} month={currentMonth} />
          </div>
        )}
      </div>

      {/* Metas anteriores */}
      {pastGoals.length > 0 && (
        <div>
          <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest mb-3 mt-6">Meses anteriores</p>
          <div className="flex flex-col gap-3">
            {pastGoals.map((g) => (
              <MonthCard
                key={g.month}
                monthKey={g.month}
                goal={g}
                plannedBooks={goalBooks?.filter((gb) => gb.month === g.month) ?? []}
                allBooks={books}
                isCurrentMonth={false}
                onDeleteGoal={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AddBooksInline({ books, month }) {
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  )

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-purple-500 hover:text-[#6b48b0] border border-purple-200 rounded-xl py-2.5 hover:bg-purple-50 transition-colors"
      >
        <PlusIcon size={14} />
        Adicionar livro à meta
      </button>
    )
  }

  return (
    <div className="border border-purple-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-purple-100">
        <SearchIcon size={14} className="text-purple-300 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          placeholder="Buscar livro da estante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm text-purple-900 placeholder:text-purple-300 outline-none bg-transparent"
        />
        <button onClick={() => setShow(false)} className="text-purple-300 hover:text-purple-500 transition-colors">
          <CloseIcon size={14} />
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-purple-300 py-6">Nenhum livro encontrado</p>
        ) : (
          filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => addBookToGoal(month, b.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 transition-colors text-left border-b border-purple-50 last:border-0"
            >
              {b.cover ? (
                <img src={b.cover} alt="" className="w-20 h-28 object-contain rounded-lg flex-shrink-0 shadow-sm" />
              ) : (
                <div className="w-20 h-28 rounded-lg bg-purple-100 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#3d1d80] truncate">{b.title}</p>
                <p className="text-xs text-purple-400 truncate">{b.author}</p>
              </div>
              <PlusIcon size={14} className="text-purple-300 flex-shrink-0 ml-auto" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
