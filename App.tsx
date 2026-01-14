
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UserInfo, LifeStats } from './types';
import DotGrid from './components/DotGrid';
import { getReflection } from './services/geminiService';

const App: React.FC = () => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [birthday, setBirthday] = useState<string>(() => {
    try {
      return localStorage.getItem('life-calendar-dob') || '';
    } catch (e) {
      console.warn("LocalStorage access denied", e);
      return '';
    }
  });

  const [expectedLifespan, setExpectedLifespan] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('life-calendar-lifespan');
      return saved ? parseInt(saved, 10) : 80;
    } catch (e) {
      return 80;
    }
  });

  const [reflection, setReflection] = useState<string>('');
  const [loadingReflection, setLoadingReflection] = useState<boolean>(false);

  const stats = useMemo<LifeStats | null>(() => {
    if (!birthday) return null;

    const dob = new Date(birthday);
    const now = new Date();
    
    if (isNaN(dob.getTime())) return null;
    
    const diffMs = now.getTime() - dob.getTime();
    if (diffMs < 0) return null;

    const msInWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksLived = diffMs / msInWeek;
    const totalWeeks = expectedLifespan * 52;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const currentAge = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    const percentLived = Math.min(100, (weeksLived / totalWeeks) * 100);

    return {
      weeksLived,
      weeksRemaining,
      totalWeeks,
      percentLived,
      currentAge
    };
  }, [birthday, expectedLifespan]);

  const fetchReflection = useCallback(async () => {
    if (stats && stats.weeksRemaining > 0) {
      setLoadingReflection(true);
      const text = await getReflection(Math.floor(stats.currentAge), Math.floor(stats.weeksRemaining), expectedLifespan);
      setReflection(text);
      setLoadingReflection(false);
    }
  }, [stats, expectedLifespan]);

  useEffect(() => {
    if (birthday && stats) {
      try {
        localStorage.setItem('life-calendar-dob', birthday);
        localStorage.setItem('life-calendar-lifespan', expectedLifespan.toString());
      } catch (e) {
        console.warn("Failed to save to localStorage", e);
      }
      fetchReflection();
    }
  }, [birthday, expectedLifespan, stats, fetchReflection]);

  const handleReset = () => {
    setBirthday('');
    setExpectedLifespan(80);
    setReflection('');
    try {
      localStorage.removeItem('life-calendar-dob');
      localStorage.removeItem('life-calendar-lifespan');
    } catch (e) {}
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 lg:p-12 selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 border-b border-slate-800 pb-8 relative z-20">
          <h1 className="text-4xl md:text-6xl font-serif font-light mb-4 tracking-tight">
            Life <span className="italic text-cyan-400">Calendar</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg font-light leading-relaxed mb-8">
            人生不過是一場倒計時。暗色代表過去，亮色代表未來。
          </p>
          
          <div className="flex flex-wrap items-end gap-4 sm:gap-6">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold italic">點選你的出生日期</label>
              
              <div className="relative group bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl transition-all shadow-lg min-w-[200px] h-[46px]">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={birthday}
                  max={today}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
                  onClick={(e) => (e.target as any).showPicker?.()}
                />
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <span className={`text-sm sm:text-base ${birthday ? 'text-slate-200' : 'text-slate-500'}`}>
                    {birthday || '選擇日期'}
                  </span>
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">📅</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-24">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold italic text-center sm:text-left">預期壽命</label>
              <input
                type="number"
                value={expectedLifespan}
                min="1"
                max="120"
                onChange={(e) => setExpectedLifespan(parseInt(e.target.value) || 80)}
                className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-center font-mono h-[46px]"
              />
            </div>

            {birthday && (
              <button 
                onClick={handleReset}
                className="px-5 py-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm uppercase tracking-wider border border-slate-800 hover:border-red-400/20 h-[46px]"
              >
                全部重置
              </button>
            )}
          </div>
        </header>

        {!birthday || !stats ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-6 animate-pulse">
              <span className="text-3xl">⏳</span>
            </div>
            <h2 className="text-2xl text-slate-300 font-serif mb-2">請設定日期以開啟生命地圖</h2>
            <p className="text-slate-500 text-lg font-light">這不僅是數字，而是你唯一一次的生命歷程。</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
            
            {/* Top Cards: Vertical Stack (Separate Rows) */}
            <div className="flex flex-col gap-8">
              {/* Row 1: Stats Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">進度概覽</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-slate-400 text-sm">生命消耗進度</span>
                      <span className="text-cyan-400 font-mono text-xl">{stats.percentLived.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-slate-700 via-cyan-600 to-cyan-400 h-full transition-all duration-1000 ease-out" 
                        style={{ width: `${stats.percentLived}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 flex justify-between items-center">
                      <p className="text-xs text-slate-500 uppercase">剩餘週數</p>
                      <p className="text-2xl font-serif text-emerald-400">
                        {Math.floor(stats.weeksRemaining).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 flex justify-between items-center">
                      <p className="text-xs text-slate-500 uppercase">目前歲數</p>
                      <p className="text-2xl font-serif text-slate-200">
                        {stats.currentAge.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: AI Reflection Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    時間的叮嚀
                  </h3>
                  <button 
                    onClick={fetchReflection}
                    disabled={loadingReflection}
                    className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest font-bold disabled:opacity-50 border border-slate-800 hover:border-cyan-900/50 px-3 py-1 rounded-lg"
                  >
                    {loadingReflection ? '感應中...' : '再聽一段'}
                  </button>
                </div>
                
                <div className="relative z-10 min-h-[80px] flex flex-col justify-center">
                  {loadingReflection ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-700 rounded w-full"></div>
                    </div>
                  ) : (
                    <p className="text-lg md:text-xl font-serif italic text-slate-100 leading-relaxed tracking-wide">
                      {reflection ? `「${reflection}」` : "「真正重要的不是你活了多少年，而是這些年你怎麼活。」"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Main Grid View */}
            <div className="overflow-hidden rounded-xl bg-slate-900/40 border border-slate-800 p-6 md:p-8 backdrop-blur-sm shadow-inner">
              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-8 flex items-center justify-between">
                <span>生命週曆 (預期 {expectedLifespan} 歲)</span>
                <span className="text-slate-600 font-mono italic">
                  第 {Math.floor(stats.weeksLived).toLocaleString()} / {Math.floor(stats.totalWeeks).toLocaleString()} 週
                </span>
              </h2>
              <DotGrid weeksLived={stats.weeksLived} totalYears={expectedLifespan} />
            </div>

            <div className="text-[10px] text-slate-600 uppercase tracking-widest text-center py-8">
              Memento Mori · Carpe Diem
            </div>
          </div>
        )}
      </div>
      
      <div className="fixed bottom-8 right-8 pointer-events-none opacity-5 hidden md:block">
         <div className="font-serif italic text-8xl select-none">Memento Mori</div>
      </div>
    </div>
  );
};

export default App;
