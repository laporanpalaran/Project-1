import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { BULAN } from "@/components/common";
import { cn } from "@/lib/utils";

export function MonthYearPicker({ bulan, tahun, onChange, testid, className }) {
  const [open, setOpen] = useState(false);
  const [vy, setVy] = useState(Number(tahun) || new Date().getFullYear());
  const label = bulan ? `${BULAN[Number(bulan)]} ${tahun}` : `Tahun ${tahun}`;
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setVy(Number(tahun)); }}>
      <PopoverTrigger asChild>
        <button type="button" data-testid={testid} className={cn("flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400", className)}>
          <CalendarDays className="h-4 w-4 text-sky-500" /> {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => setVy(vy - 1)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
          <span className="font-heading font-semibold text-slate-800">{vy}</span>
          <button type="button" onClick={() => setVy(vy + 1)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {BULAN.slice(1).map((b, i) => {
            const m = i + 1;
            const active = Number(bulan) === m && Number(tahun) === vy;
            return (
              <button key={m} type="button" data-testid={`${testid}-m${m}`} onClick={() => { onChange(m, vy); setOpen(false); }}
                className={cn("rounded-lg px-2 py-2 text-xs font-medium transition", active ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow" : "text-slate-600 hover:bg-slate-100")}>
                {b.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
