import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Badge, PageHeader, Empty } from "@/components/common";
import { Search, Download } from "lucide-react";

const FILTERS = [
  ["all", "Semua"],
  ["memenuhi_jpl", "Memenuhi 40 JPL"],
  ["belum_jpl", "Belum Memenuhi JPL"],
  ["memenuhi_sert", "Memenuhi 8 Sertifikat"],
  ["belum_sert", "Belum 8 Sertifikat"],
  ["proses", "Dalam Proses"],
];

export default function MonitoringPegawai() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [unit, setUnit] = useState("all");

  useEffect(() => { api.get("/employees").then((r) => setData(r.data)); }, []);

  const units = useMemo(() => data ? ["all", ...new Set(data.employees.map((e) => e.unit).filter(Boolean))] : ["all"], [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    const tj = data.settings.target_jpl, ts = data.settings.target_sertifikat;
    return data.employees.filter((e) => {
      if (q && !`${e.nama} ${e.nip}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (unit !== "all" && e.unit !== unit) return false;
      if (filter === "memenuhi_jpl" && e.total_jpl < tj) return false;
      if (filter === "belum_jpl" && e.total_jpl >= tj) return false;
      if (filter === "memenuhi_sert" && e.total_sertifikat < ts) return false;
      if (filter === "belum_sert" && e.total_sertifikat >= ts) return false;
      if (filter === "proses" && e.status !== "DALAM_PROSES") return false;
      return true;
    });
  }, [data, q, filter, unit]);

  const exportCsv = () => { window.open(`${api.defaults.baseURL}/export/employees?auth=${localStorage.getItem("espak_token")}`, "_blank"); };

  if (!data) return <Empty text="Memuat..." />;
  const { target_jpl, target_sertifikat } = data.settings;

  const barColor = (e) => e.total_jpl >= target_jpl ? "bg-emerald-500" : e.persen_jpl >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring Kinerja Pegawai" desc={`Target: ${target_jpl} JPL & ${target_sertifikat} sertifikat`}>
        <button data-testid="export-employees" onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><Download className="h-4 w-4" /> Export CSV</button>
      </PageHeader>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input data-testid="search-pegawai" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / NIP..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-400" />
        </div>
        <select data-testid="filter-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400">
          {units.map((u) => <option key={u} value={u}>{u === "all" ? "Semua Unit" : u}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([v, l]) => (
          <button key={v} data-testid={`pfilter-${v}`} onClick={() => setFilter(v)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${filter === v ? "bg-sky-500 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{l}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">No</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Jabatan / Unit</th><th className="px-4 py-3">JPL</th><th className="px-4 py-3">Sertifikat</th><th className="px-4 py-3 w-48">Progress</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100" data-testid="monitoring-table">
              {rows.length === 0 && <tr><td colSpan={7} className="p-8"><Empty text="Tidak ada pegawai sesuai filter" /></td></tr>}
              {rows.map((e, i) => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{e.nama}</p><p className="font-mono text-xs text-slate-400">{e.nip}</p></td>
                  <td className="px-4 py-3"><p className="text-slate-600">{e.jabatan}</p><p className="text-xs text-slate-400">{e.unit}</p></td>
                  <td className="px-4 py-3"><span className="font-bold text-slate-800">{e.total_jpl}</span><span className="text-slate-400">/{target_jpl}</span></td>
                  <td className="px-4 py-3"><span className="font-bold text-slate-800">{e.total_sertifikat}</span><span className="text-slate-400">/{target_sertifikat}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${barColor(e)}`} style={{ width: `${Math.min(e.persen_jpl, 100)}%` }} /></div>
                      <span className="w-10 text-right text-xs font-semibold text-slate-600">{e.persen_jpl}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge value={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
