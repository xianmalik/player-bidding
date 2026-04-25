export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-white/10 py-12 px-6">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-black text-xs">A</span>
          </div>
          <span className="text-sm font-black italic tracking-tighter text-white">
            ARENA<span className="text-blue-500">PRO</span>
          </span>
        </div>
        
        <div className="flex gap-8 text-[10px] font-bold tracking-[0.2em] text-slate-500">
          <a href="#" className="hover:text-blue-400 transition-colors uppercase">Documentation</a>
          <a href="#" className="hover:text-blue-400 transition-colors uppercase">Terms of Service</a>
          <a href="#" className="hover:text-blue-400 transition-colors uppercase">Support</a>
          <a href="#" className="hover:text-blue-400 transition-colors uppercase">Status</a>
        </div>

        <p className="text-[10px] font-medium text-slate-600 tracking-wider">
          &copy; 2026 ARENAPRO DIGITAL BATTLEGROUNDS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  )
}
