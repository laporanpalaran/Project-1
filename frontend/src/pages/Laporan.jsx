import { PageHeader } from "@/components/common";
import { FileSpreadsheet, FileText, Users, Activity, Download } from "lucide-react";
import { API } from "@/lib/api";

export default function Laporan() {
  const token = localStorage.getItem("espak_token");
  const dl = (path) => window.open(`${API}${path}?auth=${token}`, "_blank");

  const reports = [
    { icon: Users, title: "Rekap JPL & Kinerja Pegawai", desc: "Daftar seluruh pegawai beserta total JPL, sertifikat, dan status pencapaian.", path: "/export/employees", tone: "sky" },
    { icon: Activity, title: "Rekap Capaian SPM", desc: "Rekapitulasi capaian seluruh indikator SPM beserta status hijau/kuning/merah.", path: "/export/spm", tone: "emerald" },
  ];
  const tones = { sky: "from-sky-500 to-cyan-500", emerald: "from-emerald-500 to-teal-500" };

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan & Export Data" desc="Unduh rekapitulasi data untuk pelaporan dan integrasi Google Spreadsheet / Looker Studio." />
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

      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
        <h3 className="flex items-center gap-2 font-heading font-semibold text-sky-800"><FileSpreadsheet className="h-5 w-5" /> Integrasi Looker Studio</h3>
        <p className="mt-2 text-sm text-sky-700">Data E-SPAK tersimpan terpusat dan dapat diekspor sebagai CSV untuk menjadi sumber data Google Spreadsheet → Google Looker Studio. Alur: <span className="font-mono">Web App → API → Dataset → Looker Studio</span>.</p>
      </div>
    </div>
  );
}
