export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f3eeff] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-[#6b48b0] rounded-full animate-spin" />
        <p className="text-purple-400 text-sm font-medium">Carregando sua estante...</p>
      </div>
    </div>
  )
}
