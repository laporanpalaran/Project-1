import { PageHeader } from "@/components/common";
import { FileSpreadsheet, Users, Activity, Download, Link2, Copy, Database } from "lucide-react";
import { API } from "@/lib/api";
import { toast } from "sonner";

export default function Laporan() {
  const token = localStorage.getItem("espak_token");
  const dl = (path) => window.open(`${API}${path}?auth=${token}`, "_blank");
  const copy = (url) => { navigator.clipboard.writeText(url); toast.success("URL dataset disalin ke clipboard"); };

  const reports = [
    { icon: Users, title: "Rekap JPL & Kinerja Pegawai", desc: "Daftar seluruh pegawai beserta total JPL, sertifikat, dan status pencapaian.", path: "/export/employees", tone: "sky" },
    { icon: Activity, title: "Rekap Capaian SPM", desc: "Rekapitulasi capaian seluruh indikator SPM beserta status hijau/kuning/merah.", path: "/export/spm", tone: "emerald" },
  ];
  const tones = { sky: "from-sky-500 to-cyan-500", emerald: "from-emerald-500 to-teal-500" };

  const datasets = [
    { title: "Dataset JPL Pegawai", json: `${API}/dataset/jpl?auth=${token}`, csv: `${API}/dataset/jpl?format=csv&auth=${token}` },
    { title: "Dataset Capaian SPM", json: `${API}/dataset/spm?auth=${token}`, csv: `${API}/dataset/spm?format=csv&auth=${token}` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan & Export Data" desc="Unduh rekapitulasi data dan sambungkan dataset ke Google Sheets / Looker Studio." />

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <div key={r.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
            <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tones[r.tone]} text-white`}><r.icon className="h-6 w-6" /></span>
            <h3 className="mt-4 font-heading font-semibold text-slate-800">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm text-slate-500">{r.desc}</p>
            <button data-testid={`dl${r.path.replace(/\//g, "-")}`} onClick={() => dl(r.path)} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"><Download className="h-4 w-4" /> Download CSV</button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-6">
        <h3 className="flex items-center gap-2 font-heading font-semibold text-sky-800"><Database className="h-5 w-5" /> Konektor Google Looker Studio</h3>
        <p className="mt-2 text-sm text-sky-700">Endpoint dataset berikut siap disambungkan. Alur: <span className="font-mono text-xs">Web App → API Dataset → Google Sheets (IMPORTDATA) → Looker Studio</span>. Gunakan URL <b>CSV</b> pada rumus Google Sheets <span className="font-mono text-xs">=IMPORTDATA("...")</span>, atau URL <b>JSON</b> untuk community JSON connector.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {datasets.map((ds) => (
            <div key={ds.title} className="rounded-xl border border-sky-200 bg-white p-4">
              <p className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-slate-800"><Link2 className="h-4 w-4 text-sky-500" /> {ds.title}</p>
              {[["JSON", ds.json], ["CSV", ds.csv]].map(([label, url]) => (
                <div key={label} className="mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <div className="flex items-center gap-2">
                    <input readOnly value={url} className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-500" />
                    <button data-testid={`copy-${ds.title}-${label}`} onClick={() => copy(url)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-200"><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-sky-600"><FileSpreadsheet className="h-4 w-4" /> Token akses sudah tertaut pada URL. Perlakukan URL sebagai rahasia karena berisi kredensial Anda.</p>
      </div>
    </div>
  );
}
