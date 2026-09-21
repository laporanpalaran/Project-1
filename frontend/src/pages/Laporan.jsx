import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common";
import { FileSpreadsheet, Users, Activity, Award, Link2, Copy, Database, FileText, RefreshCw, Clock } from "lucide-react";
import api, { API } from "@/lib/api";
import { toast } from "sonner";

export default function Laporan() {
  const token = localStorage.getItem("espak_token");
  const [sync, setSync] = useState({});
  const loadSync = () => api.get("/dataset/sync-status").then((r) => setSync(r.data)).catch(() => {});
  useEffect(loadSync, []);

  const dl = (path, fmt) => window.open(`${API}${path}?format=${fmt}&auth=${token}`, "_blank");
  const copy = (url) => { navigator.clipboard.writeText(url); toast.success("URL dataset disalin ke clipboard"); };

  const reports = [
    { icon: Users, title: "Rekap JPL & Kinerja Pegawai", desc: "Total JPL, sertifikat, dan status pencapaian seluruh pegawai.", path: "/export/employees", tone: "sky" },
    { icon: Award, title: "Rekap Sertifikat", desc: "Seluruh sertifikat pelatihan beserta JPL, penyelenggara & status verifikasi.", path: "/export/certificates", tone: "indigo" },
    { icon: Activity, title: "Rekap Capaian SPM", desc: "Capaian seluruh indikator SPM beserta status hijau/kuning/merah.", path: "/export/spm", tone: "emerald" },
  ];
  const tones = { sky: "from-sky-500 to-cyan-500", emerald: "from-emerald-500 to-teal-500", indigo: "from-indigo-500 to-blue-500" };

  const datasets = [
    { title: "Dataset JPL Pegawai", key: "jpl", json: `${API}/dataset/jpl?auth=${token}`, csv: `${API}/dataset/jpl?format=csv&auth=${token}` },
    { title: "Dataset Capaian SPM", key: "spm", json: `${API}/dataset/spm?auth=${token}`, csv: `${API}/dataset/spm?format=csv&auth=${token}` },
  ];
  const fmtWaktu = (iso) => iso ? new Date(iso).toLocaleString("id-ID") : "Belum pernah";

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan & Export Data" desc="Unduh laporan resmi berkop (Excel/PDF/CSV) dan sambungkan dataset ke Google Looker Studio." />

      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((r) => (
          <div key={r.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
            <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tones[r.tone]} text-white`}><r.icon className="h-6 w-6" /></span>
            <h3 className="mt-4 font-heading font-semibold text-slate-800">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm text-slate-500">{r.desc}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button data-testid={`xlsx${r.path.replace(/\//g, "-")}`} onClick={() => dl(r.path, "xlsx")} className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</button>
              <button data-testid={`pdf${r.path.replace(/\//g, "-")}`} onClick={() => dl(r.path, "pdf")} className="flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"><FileText className="h-3.5 w-3.5" /> PDF</button>
              <button data-testid={`csv${r.path.replace(/\//g, "-")}`} onClick={() => dl(r.path, "csv")} className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-2 py-2 text-xs font-semibold text-white transition hover:bg-slate-700">CSV</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-heading font-semibold text-sky-800"><Database className="h-5 w-5" /> Konektor Google Looker Studio</h3>
          <button data-testid="refresh-sync" onClick={loadSync} className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"><RefreshCw className="h-3.5 w-3.5" /> Perbarui status</button>
        </div>
        <p className="mt-2 text-sm text-sky-700">Alur: <span className="font-mono text-xs">Web App → API Dataset → Google Sheets (IMPORTDATA) → Looker Studio</span>. Gunakan URL <b>CSV</b> pada <span className="font-mono text-xs">=IMPORTDATA("...")</span> atau URL <b>JSON</b> untuk community connector. Dataset disinkronkan otomatis setiap hari (18:00 UTC).</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {datasets.map((ds) => (
            <div key={ds.title} className="rounded-xl border border-sky-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-2 font-heading text-sm font-semibold text-slate-800"><Link2 className="h-4 w-4 text-sky-500" /> {ds.title}</p>
                <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock className="h-3 w-3" /> {fmtWaktu(sync[ds.key]?.generated_at)}</span>
              </div>
              {[["JSON", ds.json], ["CSV", ds.csv]].map(([label, url]) => (
                <div key={label} className="mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <div className="flex items-center gap-2">
                    <input readOnly value={url} className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-500" />
                    <button data-testid={`copy-${ds.key}-${label}`} onClick={() => copy(url)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-200"><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-sky-600"><FileSpreadsheet className="h-4 w-4" /> Token akses tertaut pada URL — perlakukan sebagai rahasia karena berisi kredensial Anda.</p>
      </div>
    </div>
  );
}
