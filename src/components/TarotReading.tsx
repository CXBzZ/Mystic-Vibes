import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getThreeCardReading } from '../services/kimi';
import { Loader2, Sparkles, ArrowRight, RotateCcw, MoonStar, Download, Share2, Volume2, VolumeX } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const SOUNDS = {
  ambient: "https://assets.mixkit.co/music/preview/mixkit-mystical-forest-ambient-1212.mp3",
  draw: "https://assets.mixkit.co/sfx/preview/mixkit-light-impact-with-reverb-2160.mp3",
  reveal: "https://assets.mixkit.co/sfx/preview/mixkit-magic-marimba-2820.mp3"
};

interface TarotCard {
  name: string;
  enName: string;
  image: string;
}

const TAROT_IMAGE_BASE = "https://raw.githubusercontent.com/r-tarot/r-tarot-images/main/cards";

const TAROT_CARDS: TarotCard[] = [
  { name: "愚者", enName: "The Fool", image: `${TAROT_IMAGE_BASE}/00-fool.jpg` },
  { name: "魔术师", enName: "The Magician", image: `${TAROT_IMAGE_BASE}/01-magician.jpg` },
  { name: "女祭司", enName: "The High Priestess", image: `${TAROT_IMAGE_BASE}/02-high-priestess.jpg` },
  { name: "皇后", enName: "The Empress", image: `${TAROT_IMAGE_BASE}/03-empress.jpg` },
  { name: "皇帝", enName: "The Emperor", image: `${TAROT_IMAGE_BASE}/04-emperor.jpg` },
  { name: "教皇", enName: "The Hierophant", image: `${TAROT_IMAGE_BASE}/05-hierophant.jpg` },
  { name: "恋人", enName: "The Lovers", image: `${TAROT_IMAGE_BASE}/06-lovers.jpg` },
  { name: "战车", enName: "The Chariot", image: `${TAROT_IMAGE_BASE}/07-chariot.jpg` },
  { name: "力量", enName: "Strength", image: `${TAROT_IMAGE_BASE}/08-strength.jpg` },
  { name: "隐士", enName: "The Hermit", image: `${TAROT_IMAGE_BASE}/09-hermit.jpg` },
  { name: "命运之轮", enName: "Wheel of Fortune", image: `${TAROT_IMAGE_BASE}/10-wheel-of-fortune.jpg` },
  { name: "正义", enName: "Justice", image: `${TAROT_IMAGE_BASE}/11-justice.jpg` },
  { name: "倒吊人", enName: "The Hanged Man", image: `${TAROT_IMAGE_BASE}/12-hanged-man.jpg` },
  { name: "死神", enName: "Death", image: `${TAROT_IMAGE_BASE}/13-death.jpg` },
  { name: "节制", enName: "Temperance", image: `${TAROT_IMAGE_BASE}/14-temperance.jpg` },
  { name: "恶魔", enName: "The Devil", image: `${TAROT_IMAGE_BASE}/15-devil.jpg` },
  { name: "高塔", enName: "The Tower", image: `${TAROT_IMAGE_BASE}/16-tower.jpg` },
  { name: "星星", enName: "The Star", image: `${TAROT_IMAGE_BASE}/17-star.jpg` },
  { name: "月亮", enName: "The Moon", image: `${TAROT_IMAGE_BASE}/18-moon.jpg` },
  { name: "太阳", enName: "The Sun", image: `${TAROT_IMAGE_BASE}/19-sun.jpg` },
  { name: "审判", enName: "Judgement", image: `${TAROT_IMAGE_BASE}/20-judgment.jpg` },
  { name: "世界", enName: "The World", image: `${TAROT_IMAGE_BASE}/21-world.jpg` }
];

function shuffle(array: TarotCard[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function TarotReading() {
  const [step, setStep] = useState<'input' | 'draw' | 'reading'>('input');
  const [question, setQuestion] = useState('');
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [reading, setReading] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const ambientAudio = useRef<HTMLAudioElement | null>(null);
  const sfxAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ambientAudio.current = new Audio(SOUNDS.ambient);
    ambientAudio.current.loop = true;
    ambientAudio.current.volume = 0.4;
    
    sfxAudio.current = new Audio();
    sfxAudio.current.volume = 0.6;

    return () => {
      ambientAudio.current?.pause();
      ambientAudio.current = null;
      sfxAudio.current = null;
    };
  }, []);

  useEffect(() => {
    if (ambientAudio.current) {
      if (!isMuted && step !== 'input') {
        ambientAudio.current.play().catch(e => console.log("Audio play blocked:", e));
      } else {
        ambientAudio.current.pause();
      }
    }
  }, [isMuted, step]);

  const playSfx = (type: 'draw' | 'reveal') => {
    if (isMuted || !sfxAudio.current) return;
    sfxAudio.current.src = SOUNDS[type];
    sfxAudio.current.play().catch(e => console.log("SFX play blocked:", e));
  };

  const handleStartDraw = () => {
    if (!question.trim()) return;
    setDeck(shuffle(TAROT_CARDS));
    setSelectedIndices([]);
    setStep('draw');
    if (isMuted) setIsMuted(false); // Auto-unmute on first interaction if possible
  };

  const handleSelectCard = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else if (selectedIndices.length < 3) {
      setSelectedIndices([...selectedIndices, index]);
      playSfx('draw');
    }
  };

  const handleReveal = async () => {
    if (selectedIndices.length !== 3) return;
    setStep('reading');
    setIsGenerating(true);
    const drawnCards = selectedIndices.map(i => `${deck[i].name} (${deck[i].enName})`);
    try {
      const result = await getThreeCardReading(question, drawnCards);
      setReading(result);
      playSfx('reveal');
    } catch (error) {
      console.error(error);
      setReading("灵界信号微弱，请稍后再试... 🌙");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep('input');
    setQuestion('');
    setReading(null);
    setSelectedIndices([]);
  };

  const handleDownloadImage = async () => {
    if (!resultRef.current) return;
    setIsDownloading(true);
    setIsCapturing(true);
    try {
      const dataUrl = await htmlToImage.toPng(resultRef.current, {
        backgroundColor: '#11131A',
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `cyber-tarot-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('生成长图失败，请稍后再试 🌙');
    } finally {
      setIsDownloading(false);
      setIsCapturing(false);
    }
  };

  const handleShareImage = async () => {
    if (!resultRef.current) return;
    setIsSharing(true);
    setIsCapturing(true);
    try {
      // Use toBlob directly as it's faster and avoids fetch()
      const blob = await htmlToImage.toBlob(resultRef.current, {
        backgroundColor: '#11131A',
        pixelRatio: 2,
        cacheBust: true,
      });

      if (!blob) throw new Error('Failed to generate image blob');

      const file = new File([blob], `cyber-tarot-${new Date().getTime()}.png`, { type: 'image/png' });

      // Check if sharing is supported and the file can be shared
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '我的赛博塔罗占卜结果',
            text: '快来看看宇宙给我的 Vibe Check！🌙✨',
          });
        } catch (shareError: any) {
          // If the user cancelled or the gesture was lost, fallback to download
          if (shareError.name !== 'AbortError') {
            console.warn('Share failed, falling back to download:', shareError);
            triggerDownload(blob);
          }
        }
      } else {
        // Fallback to download if share is not supported
        triggerDownload(blob);
        alert('您的浏览器不支持直接分享，已为您自动下载图片 🌙');
      }
    } catch (error: any) {
      console.error('Failed to prepare share image:', error);
      if (error.name !== 'AbortError') {
        alert('生成分享图片失败，请稍后再试 🌙');
      }
    } finally {
      setIsSharing(false);
      setIsCapturing(false);
    }
  };

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `cyber-tarot-${new Date().getTime()}.png`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="flex flex-col items-center w-full relative">
      {/* Mute Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 z-50 p-3 rounded-full glass-panel border-gold/30 text-gold hover:bg-gold/10 transition-all duration-300"
        title={isMuted ? "开启声音" : "静音"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {step === 'input' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-panel p-8 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <MoonStar className="text-gold" size={28} />
            <h2 className="font-serif text-3xl font-bold text-gold tracking-wider">你想算点啥？</h2>
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="闭上眼睛，在心中默念你的问题...&#10;比如：我最近的桃花运尊嘟假嘟？"
            className="w-full glass-input p-4 font-sans mb-6 resize-none h-32 leading-relaxed"
          />
          <button
            onClick={handleStartDraw}
            disabled={!question.trim()}
            className="w-full gold-btn py-4 font-serif text-lg flex justify-center items-center gap-2"
          >
            开启灵界链接 <Sparkles size={20} />
          </button>
        </motion.div>
      )}

      {step === 'draw' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex flex-col items-center"
        >
          <div className="glass-panel p-6 mb-10 text-center w-full max-w-2xl">
            <h2 className="font-serif text-2xl font-bold text-gold mb-2 tracking-widest">凭直觉抽取 3 张牌</h2>
            <p className="font-sans text-sm text-ivory-dim tracking-wider">
              已选 {selectedIndices.length}/3 张
            </p>
            <div className="flex justify-center gap-4 mt-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-12 h-16 rounded-md border border-gold/30 flex items-center justify-center transition-all duration-500 ${selectedIndices.length > i ? 'bg-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-black/20'}`}>
                  {selectedIndices.length > i ? <Sparkles size={16} className="text-gold" /> : <span className="text-gold/30 font-serif">?</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 mb-10 w-full max-w-3xl">
            {deck.map((_, index) => {
              const isSelected = selectedIndices.includes(index);
              const selectionNumber = selectedIndices.indexOf(index) + 1;
              return (
                <motion.button
                  key={index}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(212, 175, 55, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectCard(index)}
                  className={`aspect-[2/3] rounded-lg relative overflow-hidden transition-all duration-300 border ${
                    isSelected 
                      ? 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]' 
                      : 'border-white/10 hover:border-gold/50'
                  }`}
                  style={{
                    background: isSelected 
                      ? 'rgba(212, 175, 55, 0.1)' 
                      : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                  }}
                >
                  {/* Card Back Pattern */}
                  {!isSelected && (
                    <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                      <div className="w-full h-full border-[1px] border-gold/30 m-1 rounded-md flex items-center justify-center">
                        <MoonStar size={24} className="text-gold" />
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center font-serif font-bold text-3xl text-gold drop-shadow-md">
                      {selectionNumber}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {selectedIndices.length === 3 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleReveal}
              className="gold-btn px-10 py-4 font-serif text-xl flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              揭晓命运剧本 <ArrowRight size={24} />
            </motion.button>
          )}
        </motion.div>
      )}

      {step === 'reading' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl flex flex-col items-center"
        >
          <div ref={resultRef} className="w-full flex flex-col items-center p-4 md:p-8 rounded-3xl relative">
            {/* Background pattern for exported image */}
            <div className={`absolute inset-0 pointer-events-none rounded-3xl ${isCapturing ? 'opacity-100' : 'opacity-0'}`} style={{
               backgroundImage: 'radial-gradient(circle at 50% 0%, #4A3B69 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(138, 154, 91, 0.15) 0%, transparent 50%)'
            }}></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12 relative z-10">
              {['过去', '现在', '未来'].map((label, i) => {
                const card = deck[selectedIndices[i]];
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className="font-serif text-gold tracking-[0.3em] mb-4 text-lg flex items-center gap-2">
                      <span className="h-[1px] w-4 bg-gold/50"></span>
                      {label}
                      <span className="h-[1px] w-4 bg-gold/50"></span>
                    </div>
                    <motion.div 
                      initial={{ rotateY: 180, opacity: 0 }}
                      animate={{ 
                        rotateY: 0, 
                        opacity: 1,
                        y: [0, -8, 0] 
                      }}
                      transition={{ 
                        rotateY: { duration: 1.2, delay: i * 0.4, type: "spring", stiffness: 50 },
                        opacity: { duration: 0.8, delay: i * 0.4 },
                        y: { 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: i * 0.5 
                        }
                      }}
                      className="w-full aspect-[2/3] glass-panel p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-shadow duration-500"
                    >
                      <div className="w-full h-full relative overflow-hidden rounded-lg bg-midnight/50">
                        {/* Loading Spinner for Image */}
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                          <Loader2 className="animate-spin text-gold/20" size={24} />
                        </div>
                        
                        <motion.img 
                          src={card.image} 
                          alt={card.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover relative z-10"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.opacity = '1';
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Fallback to a card back pattern if image fails
                            target.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop";
                            target.style.opacity = '0.5';
                          }}
                          style={{ opacity: 0, transition: 'opacity 0.5s ease' }}
                        />
                        {/* Subtle shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-white/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20"></div>
                      </div>
                      
                      {/* Integrated Label Overlay - Always partially visible, fully on hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-midnight via-midnight/80 to-transparent pt-16 pb-4 px-2 z-30">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.4 + 0.8 }}
                        >
                          <h3 className="font-serif text-xl font-bold text-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{card.name}</h3>
                          <p className="font-sans text-[10px] text-ivory-dim tracking-[0.2em] uppercase font-medium mt-1">{card.enName}</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div className="w-full glass-panel p-8 md:p-10 relative overflow-hidden z-10">
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/30"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-gold/30"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-gold/30"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/30"></div>

              <h3 className="font-serif text-3xl font-bold mb-8 text-gold text-center tracking-widest flex items-center justify-center gap-4">
                <Sparkles size={20} className="text-gold/50" />
                宇宙的 Vibe Check
                <Sparkles size={20} className="text-gold/50" />
              </h3>
              
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <Loader2 className="animate-spin text-gold" size={40} />
                  <p className="font-serif text-gold/70 tracking-widest animate-pulse">正在解读星象轨迹...</p>
                </div>
              ) : (
                <div className="font-sans text-lg leading-loose text-ivory/90 whitespace-pre-wrap px-4 md:px-8">
                  {reading}
                </div>
              )}
            </div>
          </div>

          {!isGenerating && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={handleShareImage}
                disabled={isSharing || isDownloading}
                className="px-8 py-3 rounded-full gold-btn font-serif tracking-widest flex items-center gap-2 disabled:opacity-70 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                {isSharing ? '准备中...' : '分享占卜'}
              </button>
              <button
                onClick={handleDownloadImage}
                disabled={isDownloading || isSharing}
                className="px-8 py-3 rounded-full border border-gold/50 text-gold font-serif tracking-widest flex items-center gap-2 hover:bg-gold/10 transition-colors duration-300"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isDownloading ? '生成中...' : '保存图片'}
              </button>
              <button
                onClick={reset}
                className="px-8 py-3 rounded-full border border-white/20 text-white/70 font-serif tracking-widest flex items-center gap-2 hover:bg-white/5 transition-colors duration-300"
              >
                <RotateCcw size={18} /> 重新占卜
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
