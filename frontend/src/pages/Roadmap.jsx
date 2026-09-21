import { PageHeader } from "@/components/common";
import { Flag, Rocket, BarChart3, Award } from "lucide-react";

const QUARTERS = [
  { q: "Triwulan 1", icon: Flag, tone: "sky", title: "Persiapan & Perancangan", items: ["Analisis kebutuhan", "Pemetaan masalah", "Konsultasi Kepala Puskesmas & pemegang program", "Perancangan database", "Perancangan prototype dashboard"] },
  { q: "Triwulan 2", icon: Rocket, tone: "amber", title: "Uji Coba & Sosialisasi", items: ["Penyusunan SOP", "Sosialisasi teknis", "Pilot project", "Fokus awal: Stunting, KIA, Tuberkulosis"] },
  { q: "Triwulan 3", icon: BarChart3, tone: "indigo", title: "Implementasi Penuh & Analisis", items: ["Implementasi seluruh program", "Monitoring rutin", "Analisis tren", "Penyusunan tindak lanjut evaluasi program"] },
  { q: "Triwulan 4", icon: Award, tone: "emerald", title: "Evaluasi & Pelembagaan", items: ["Evaluasi efisiensi waktu pelaporan", "Evaluasi dampak terhadap capaian SPM", "Penyusunan laporan evaluasi", "Penerbitan SK Kepala Puskesmas", "Pelembagaan E-SPAK berkelanjutan"] },
];
const tones = { sky: "from-sky-500 to-cyan-500", amber: "from-amber-500 to-orange-500", indigo: "from-indigo-500 to-blue-500", emerald: "from-emerald-500 to-teal-500" };

export default function Roadmap() {
  return (
    <div className="space-y-6">
      <PageHeader title="Roadmap Implementasi 1 Tahun" desc="Rencana implementasi E-SPAK Puskesmas Palaran secara bertahap." />
      <div className="grid gap-5 md:grid-cols-2">
        {QUARTERS.map((q) => (
          <div key={q.q} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tones[q.tone]} text-white shadow`}><q.icon className="h-6 w-6" /></span>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{q.q}</p><h3 className="font-heading text-lg font-bold text-slate-900">{q.title}</h3></div>
            </div>
            <ul className="mt-4 space-y-2">
              {q.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm text-slate-600"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${tones[q.tone]}`} />{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
