import { useState, useRef } from 'react';
import { editImage } from '../services/gemini';
import { Upload, Wand2, Loader2, Download, Sparkles, Moon } from 'lucide-react';

export default function ImageEditor() {
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const match = base64String.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        setImage({
          mimeType: match[1],
          data: match[2]
        });
        setResultImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!image || !prompt.trim()) return;

    setIsEditing(true);
    try {
      const result = await editImage(image.data, image.mimeType, prompt);
      setResultImage(result);
    } catch (error) {
      console.error(error);
      alert("灵力不足，滤镜施加失败。");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full glass-panel p-8 mb-8 relative overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold/30"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold/30"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold/30"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold/30"></div>

        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-gold" size={24} />
          <h2 className="font-serif text-3xl font-bold text-gold tracking-widest">气场滤镜</h2>
        </div>
        <p className="font-sans text-sm mb-8 text-ivory-dim tracking-wider">Powered by Gemini Nano Banana</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            {!image ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-2xl border-2 border-dashed border-gold/40 bg-black/20 hover:bg-gold/10 flex flex-col items-center justify-center gap-4 transition-all duration-300 group"
              >
                <Upload size={48} className="text-gold/60 group-hover:text-gold transition-colors" />
                <span className="font-serif text-xl text-gold tracking-widest">上传灵体影像</span>
              </button>
            ) : (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden group border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <img 
                  src={`data:${image.mimeType};base64,${image.data}`} 
                  alt="Original" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-midnight/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 rounded-full border border-gold text-gold font-serif tracking-widest hover:bg-gold hover:text-midnight transition-colors"
                  >
                    更换影像
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="font-serif text-gold tracking-widest text-lg">想要注入什么能量？</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="比如：加上一层神秘的紫色星空滤镜..."
                className="w-full glass-input p-4 font-sans text-ivory"
              />
            </div>

            <button
              onClick={handleEdit}
              disabled={!image || !prompt.trim() || isEditing}
              className="w-full gold-btn py-4 font-serif text-lg flex justify-center items-center gap-2 mt-2"
            >
              {isEditing ? <Loader2 className="animate-spin" /> : <><Wand2 size={20} /> 施放魔法</>}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="w-full aspect-square rounded-2xl bg-black/30 border border-gold/20 flex items-center justify-center relative overflow-hidden shadow-inner">
              {resultImage ? (
                <img src={resultImage} alt="Edited" className="w-full h-full object-cover" />
              ) : isEditing ? (
                <div className="flex flex-col items-center gap-6 text-gold/70">
                  <div className="relative">
                    <Loader2 size={64} className="animate-spin" />
                    <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <span className="font-serif tracking-widest text-lg animate-pulse">炼金术进行中...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-gold/30 p-8 text-center">
                  <Moon size={48} className="opacity-50" />
                  <span className="font-serif tracking-widest text-lg">
                    你的赛博大作将在这里显现
                  </span>
                </div>
              )}
            </div>

            {resultImage && (
              <a
                href={resultImage}
                download="cyber-aura-edit.png"
                className="w-full px-6 py-4 rounded-full border border-gold/50 text-gold font-serif tracking-widest flex justify-center items-center gap-3 hover:bg-gold/10 transition-colors duration-300 mt-auto"
              >
                <Download size={20} /> 保存影像
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
