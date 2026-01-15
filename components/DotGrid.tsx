
import React, { useMemo } from 'react';

interface DotGridProps {
  weeksLived: number;
  totalYears: number;
}

const DotGrid: React.FC<DotGridProps> = ({ weeksLived, totalYears }) => {
  const weeksPerYear = 52;
  
  const years = useMemo(() => {
    return Array.from({ length: totalYears }, (_, i) => i);
  }, [totalYears]);

  return (
    <div className="flex flex-col gap-1 w-full pb-4">
      {years.map((year) => (
        <div key={year} className="flex items-center w-full">
          {/* 年份數字，固定寬度 */}
          <span className="w-6 sm:w-8 text-[9px] sm:text-[10px] text-slate-500 font-mono text-right mr-1 sm:mr-2 shrink-0">
            {year + 1}
          </span>
          
          {/* 52 週的點，使用 grid-cols-52 確保在一行內完整排列 */}
          <div 
            className="grid flex-1 gap-[1px] sm:gap-1" 
            style={{ gridTemplateColumns: `repeat(${weeksPerYear}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: weeksPerYear }, (_, weekIndex) => {
              const currentGlobalWeek = year * weeksPerYear + weekIndex;
              const isLived = currentGlobalWeek < weeksLived;
              const isCurrentWeek = currentGlobalWeek === Math.floor(weeksLived);

              return (
                <div
                  key={weekIndex}
                  className={`
                    aspect-square w-full rounded-full transition-all duration-500
                    ${isLived 
                      ? 'bg-slate-800 border border-slate-700/50' 
                      : isCurrentWeek 
                        ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]' 
                        : 'bg-emerald-500 opacity-80'
                    }
                    hover:scale-[2.5] hover:z-10 cursor-help relative
                  `}
                  title={`Year ${year + 1}, Week ${weekIndex + 1}`}
                />
              );
            })}
          </div>
        </div>
      ))}
      
      {/* 圖例說明 */}
      <div className="flex gap-1 items-center mt-4">
         <span className="w-6 sm:w-8 mr-1 sm:mr-2"></span>
         <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
              <span>已度過</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>本週</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>未來</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DotGrid;
