import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Empty } from "@/components/common";
import { AlertTriangle, Activity, Users, Database, ShieldAlert } from "lucide-react";

const LEVEL = {
  merah: { cls: "border-rose-200 bg-rose-50", dot: "bg-rose-500", text: "text-rose-700", label: "Kritis" },
  kuning: { cls: "border-amber-200 bg-amber-50", dot: "bg-amber-500", text: "text-amber-700", label: "Waspada" },
};
const ICON = { spm: Activity, pegawai: Users, data: Database };

export default function EarlyWarning() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/ews").then((r) => setD(r.data)); }, []);
  if (!d) return <Empty text="Memuat..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Early Warning System" desc="Sistem peringatan dini capaian SPM & kinerja pegawai." />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><p className="flex items-center gap-2 text-sm font-semibold text-rose-700"><ShieldAlert className="h-5 w-5" />Peringatan Kritis</p><p className="mt-1 font-heading text-3xl font-extrabold text-rose-600">{d.counts.merah}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="flex items-center gap-2 text-sm font-semibold text-amber-700"><AlertTriangle className="h-5 w-5" />Perlu Perhatian</p><p className="mt-1 font-heading text-3xl font-extrabold text-amber-600">{d.counts.kuning}</p></div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="flex items-center gap-2 text-sm font-semibold text-sky-700"><Users className="h-5 w-5" />Pegawai Belum Target</p><p className="mt-1 font-heading text-3xl font-extrabold text-sky-600">{d.counts.pegawai_belum}</p></div>
      </div>

      <div className="space-y-3" data-testid="ews-list">
        {d.warnings.length === 0 && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-700">✓ Tidak ada peringatan. Seluruh indikator & kinerja dalam kondisi baik.</div>}
        {d.warnings.map((w, i) => {
          const lv = LEVEL[w.level] || LEVEL.kuning;
          const Icon = ICON[w.tipe] || AlertTriangle;
          return (
            <div key={i} className={`flex items-start gap-4 rounded-2xl border p-5 ${lv.cls}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${lv.dot} text-white`}><Icon className="h-5 w-5" /></span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-heading font-semibold ${lv.text}`}>PERINGATAN: {w.judul}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${lv.dot} text-white`}>{lv.label}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{w.pesan}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
