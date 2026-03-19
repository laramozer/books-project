import { LayersIcon, PlusIcon } from './Icons'

export default function Sidebar({ navItems, activeTab, onTabChange, onAdd, totalBooks }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-purple-100 fixed top-0 left-0 z-50">
      <div className="px-6 py-7 flex items-center gap-3 border-b border-purple-100">
        <div className="w-9 h-9 rounded-xl bg-[#ede8ff] flex items-center justify-center">
          <LayersIcon size={20} className="text-[#6b48b0]" />
        </div>
        <div>
          <p className="text-[#3d1d80] font-bold text-base leading-tight">Minha Estante</p>
          <p className="text-purple-400 text-xs">{totalBooks} {totalBooks === 1 ? 'livro' : 'livros'}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-6 flex-1">
        <p className="text-purple-300 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Biblioteca</p>
        {navItems.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
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
          onClick={onAdd}
          className="w-full bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-purple-200"
        >
          <PlusIcon size={16} />
          Adicionar livro
        </button>
      </div>
    </aside>
  )
}
