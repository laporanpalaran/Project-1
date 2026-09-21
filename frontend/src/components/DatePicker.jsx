import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DatePicker({ value, onChange, testid, placeholder = "Pilih tanggal" }) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testid}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          <span className={cn(value ? "text-slate-800" : "text-slate-400")}>
            {value ? format(date, "dd MMMM yyyy", { locale: id }) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => { if (d) onChange(format(d, "yyyy-MM-dd")); setOpen(false); }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
