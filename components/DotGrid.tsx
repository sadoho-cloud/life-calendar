
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
    <div className="flex flex-col gap-1 overflow-x-auto pb-4">
      {years.map((year) => (
        <div key={year} className="flex gap-1 items-center">
          <span className="w-8 text-[10px] text-slate-500 font-mono text-right mr-2 shrink-0">
            {year + 1}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: weeksPerYear }, (_, weekIndex) => {
              const currentGlobalWeek = year * weeksPerYear + weekIndex;
              const isLived = currentGlobalWeek < weeksLived;
              const isCurrentWeek = currentGlobalWeek === Math.floor(weeksLived);

              return (
                <div
                  key={weekIndex}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-500
                    ${isLived 
                      ? 'bg-slate-800 border border-slate-700' 
                      : isCurrentWeek 
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                        : 'bg-emerald-500 opacity-80'
                    }
                    hover:scale-150 cursor-help
                  `}
                  title={`Year ${year + 1}, Week ${weekIndex + 1}`}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex gap-1 items-center mt-2">
         <span className="w-8 mr-2"></span>
         <div className="flex gap-4 text-[10px] text-slate-400 uppercase tracking-widest mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
              <span>已度過</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>本週</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>未來</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DotGrid;
