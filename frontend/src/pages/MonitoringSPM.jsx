import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Empty, Badge, BULAN } from "@/components/common";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const now = new Date();

export default function MonitoringSPM() {
  const [d, setD] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [allMonths, setAllMonths] = useState(false);
  const [programId, setProgramId] = useState("");
  const [mode, setMode] = useState("single");
  const d3 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const [rb, setRb] = useState(d3.getMonth() + 1);
  const [ry, setRy] = useState(d3.getFullYear());
  const [eb, setEb] = useState(now.getMonth() + 1);
  const [ey, setEy] = useState(now.getFullYear());

  const load = () => {
    const params = {};
    if (mode === "range") {
      params.start_bulan = rb; params.start_tahun = ry; params.end_bulan = eb; params.end_tahun = ey;
    } else {
      params.tahun = tahun;
      if (!allMonths) params.bulan = bulan;
    }
    if (programId) params.program_id = programId;
    api.get("/spm/dashboard", { params }).then((r) => setD(r.data));
  };
  useEffect(() => { api.get("/programs").then((r) => setPrograms(r.data)); }, []);
  useEffect(() => { load(); }, [mode, bulan, tahun, allMonths, programId, rb, ry, eb, ey]);

  if (!d) return <Empty text="Memuat..." />;
  const s = d.summary;
  const donut = [{ name: "Tercapai", value: s.hijau, c: "#10b981" }, { name: "Waspada", value: s.kuning, c: "#f59e0b" }, { name: "Kritis", value: s.merah, c: "#ef4444" }];
  const barData = d.reports.map((r) => ({ nama: r.nama_indikator.length > 22 ? r.nama_indikator.slice(0, 22) + "…" : r.nama_indikator, capaian: r.capaian, target: r.target, status: r.status }));
  const trend = d.trend.map((t) => ({ label: BULAN[t.bulan]?.slice(0, 3), capaian: t.rata_capaian }));
  const inputCls = "rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400";

  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring SPM" desc="Dashboard capaian Standar Pelayanan Minimal Puskesmas." />

      <div className="space-y-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button data-testid="spm-mode-single" onClick={() => setMode("single")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "single" ? "bg-sky-500 text-white shadow" : "text-slate-600"}`}>Per Bulan</button>
          <button data-testid="spm-mode-range" onClick={() => setMode("range")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "range" ? "bg-sky-500 text-white shadow" : "text-slate-600"}`}>Rentang Periode</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mode === "single" ? (
            <>
              <MonthYearPicker testid="spm-periode" bulan={allMonths ? "" : bulan} tahun={tahun} onChange={(b, y) => { setBulan(b); setTahun(y); setAllMonths(false); }} />
              <button data-testid="spm-all-months" onClick={() => setAllMonths(!allMonths)} className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${allMonths ? "border-sky-500 bg-sky-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>Semua Bulan {tahun}</button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-slate-500">Dari</span>
              <MonthYearPicker testid="spm-range-start" bulan={rb} tahun={ry} onChange={(b, y) => { setRb(b); setRy(y); }} />
              <span className="text-sm font-medium text-slate-500">s/d</span>
              <MonthYearPicker testid="spm-range-end" bulan={eb} tahun={ey} onChange={(b, y) => { setEb(b); setEy(y); }} />
            </>
          )}
          <select data-testid="spm-program" value={programId} onChange={(e) => setProgramId(e.target.value)} className={inputCls}><option value="">Semua Program</option>{programs.map((p) => <option key={p.id} value={p.id}>{p.nama_program}</option>)}</select>
        </div>
        {mode === "range" && <p className="text-xs text-slate-400">Menampilkan akumulasi capaian: total numerator ÷ total denominator sepanjang rentang periode.</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase text-slate-500">Total Indikator</p><p className="mt-1 font-heading text-3xl font-extrabold text-slate-900">{s.total}</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-emerald-700"><CheckCircle2 className="h-4 w-4" />Tercapai</p><p className="mt-1 font-heading text-3xl font-extrabold text-emerald-600">{s.hijau}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-amber-700"><AlertTriangle className="h-4 w-4" />Waspada</p><p className="mt-1 font-heading text-3xl font-extrabold text-amber-600">{s.kuning}</p></div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-rose-700"><XCircle className="h-4 w-4" />Kritis</p><p className="mt-1 font-heading text-3xl font-extrabold text-rose-600">{s.merah}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 font-heading font-semibold text-slate-800">Capaian vs Target per Indikator</h3>
          {barData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="nama" angle={-35} textAnchor="end" interval={0} height={70} tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="capaian" radius={[6, 6, 0, 0]}>
                  {barData.map((e, i) => <Cell key={i} fill={e.status === "hijau" ? "#10b981" : e.status === "kuning" ? "#f59e0b" : "#ef4444"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-heading font-semibold text-slate-800">Distribusi Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart><Pie data={donut} dataKey="value" nameKey="name" innerRadius={50} outerRadius={82} paddingAngle={2}>{donut.map((e, i) => <Cell key={i} fill={e.c} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-sm text-slate-500">{s.persen_tercapai}% indikator mencapai target</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-heading font-semibold text-slate-800">Tren Rata-rata Capaian Bulanan ({tahun})</h3>
        {trend.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} /><YAxis tick={{ fontSize: 12, fill: "#64748b" }} /><Tooltip />
              <Line type="monotone" dataKey="capaian" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Program</th><th className="px-4 py-3">Indikator</th><th className="px-4 py-3">Periode</th><th className="px-4 py-3">Capaian</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100" data-testid="spm-table">
              {d.reports.length === 0 && <tr><td colSpan={6} className="p-8"><Empty /></td></tr>}
              {d.reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-500">{r.nama_program}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.nama_indikator}</td>
                  <td className="px-4 py-3 text-slate-500">{r.bulan ? `${BULAN[r.bulan]} ${r.tahun}` : "Akumulasi"}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{r.capaian}%</td>
                  <td className="px-4 py-3 text-slate-500">{r.target}%</td>
                  <td className="px-4 py-3"><Badge type="spm" value={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
