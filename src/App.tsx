import { useState } from 'react';
import TarotReading from './components/TarotReading';
import ImageEditor from './components/ImageEditor';
import { Sparkles, Image as ImageIcon, Moon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tarot' | 'editor'>('tarot');

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 opacity-20 pointer-events-none">
        <Moon size={120} className="text-gold" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 pointer-events-none">
        <Sparkles size={160} className="text-gold" />
      </div>

      <header className="w-full max-w-4xl mb-12 text-center relative z-10 mt-8">
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-widest mb-4 text-ivory drop-shadow-lg">
          赛博 <span className="text-gold italic">塔罗</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold opacity-50"></div>
          <p className="font-sans text-sm md:text-base tracking-[0.2em] text-ivory-dim uppercase">
            Z世代的赛博修仙指南
          </p>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold opacity-50"></div>
        </div>
      </header>

      <div className="flex gap-4 mb-10 relative z-10 bg-black/20 p-2 rounded-full backdrop-blur-md border border-white/5">
        <button
          onClick={() => setActiveTab('tarot')}
          className={`px-8 py-3 font-serif font-bold tracking-wider rounded-full flex items-center gap-2 transition-all duration-300 ${
            activeTab === 'tarot' 
              ? 'bg-gold text-midnight shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
              : 'text-ivory-dim hover:text-ivory hover:bg-white/5'
          }`}
        >
          <Sparkles size={18} />
          塔罗占卜
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-8 py-3 font-serif font-bold tracking-wider rounded-full flex items-center gap-2 transition-all duration-300 ${
            activeTab === 'editor' 
              ? 'bg-gold text-midnight shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
              : 'text-ivory-dim hover:text-ivory hover:bg-white/5'
          }`}
        >
          <ImageIcon size={18} />
          气场滤镜
        </button>
      </div>

      <main className="w-full max-w-4xl relative z-10">
        {activeTab === 'tarot' ? <TarotReading /> : <ImageEditor />}
      </main>
    </div>
  );
}
