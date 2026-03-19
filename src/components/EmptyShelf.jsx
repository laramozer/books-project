import { BookIcon, PlusIcon } from './Icons'

export default function EmptyShelf({ onAdd }) {
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
