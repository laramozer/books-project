import { LayersIcon, SearchIcon, PlusIcon } from './Icons'

export default function Topbar({ navItems, activeTab, onTabChange, search, onSearchChange, onAdd }) {
  return (
    <header className="sticky top-0 z-40 bg-[#f3eeff]/90 backdrop-blur-md border-b border-purple-100">
      <div className="px-6 py-4 flex items-center gap-4">
        {/* Logo mobile */}
        <div className="flex items-center gap-2.5 lg:hidden mr-auto">
          <div className="w-8 h-8 rounded-xl bg-[#ede8ff] flex items-center justify-center">
            <LayersIcon size={16} className="text-[#6b48b0]" />
          </div>
          <span className="font-bold text-[#3d1d80]">Minha Estante</span>
        </div>

        {/* Busca desktop */}
        <div className="relative hidden lg:flex items-center mr-auto">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar na estante..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm w-72 bg-white text-purple-900 placeholder:text-purple-300 shadow-sm"
          />
        </div>

        {/* Botão adicionar mobile */}
        <button
          onClick={onAdd}
          className="lg:hidden ml-auto bg-[#6b48b0] hover:bg-[#7d57c8] active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5"
        >
          <PlusIcon size={14} />
          Adicionar
        </button>
      </div>

      {/* Busca mobile */}
      <div className="lg:hidden px-6 pb-3">
        <div className="relative flex items-center">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar na estante..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white text-purple-900 placeholder:text-purple-300 shadow-sm"
          />
        </div>
      </div>

      {/* Abas mobile */}
      <div className="lg:hidden flex gap-1 px-6 pb-3 overflow-x-auto">
        {navItems.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
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
  )
}
