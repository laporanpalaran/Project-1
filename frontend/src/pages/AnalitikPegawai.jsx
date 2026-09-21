import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatCard, PageHeader, Empty } from "@/components/common";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, Users, Target } from "lucide-react";

const shortName = (n) => n.split(",")[0].split(" ").slice(0, 2).join(" ");

export default function AnalitikPegawai() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/analytics/employees").then((r) => setD(r.data)); }, []);
  if (!d) return <Empty text="Memuat..." />;
  const target = d.settings.target_jpl;
  const top = d.top.map((r) => ({ nama: shortName(r.nama), jpl: r.total_jpl }));
  const bottom = d.bottom.map((r) => ({ nama: shortName(r.nama), jpl: r.total_jpl }));
  const perUnit = d.per_unit.map((u) => ({ unit: u.unit, rata_jpl: u.rata_jpl, rata_sertifikat: u.rata_sertifikat }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analitik Pegawai" desc="Analisis distribusi JPL, ranking, dan perbandingan antar unit/program." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Rata-rata JPL" value={d.rata_jpl} icon={Target} tone="sky" />
        <StatCard label="Median JPL" value={d.median_jpl} icon={Target} tone="indigo" />
        <StatCard label="Memenuhi Target" value={`${d.persen_memenuhi}%`} icon={Users} tone="emerald" />
        <StatCard label="Target JPL" value={target} icon={Target} tone="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-heading font-semibold text-slate-800"><TrendingUp className="h-5 w-5 text-emerald-500" /> Top 10 JPL Tertinggi</h3>
          {top.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis type="category" dataKey="nama" width={110} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="jpl" radius={[0, 6, 6, 0]}>{top.map((e, i) => <Cell key={i} fill={e.jpl >= target ? "#10b981" : "#0ea5e9"} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-heading font-semibold text-slate-800"><TrendingDown className="h-5 w-5 text-rose-500" /> 10 JPL Terendah</h3>
          {bottom.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={bottom} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis type="category" dataKey="nama" width={110} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="jpl" radius={[0, 6, 6, 0]}>{bottom.map((e, i) => <Cell key={i} fill={e.jpl >= target ? "#10b981" : "#f43f5e"} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 font-heading font-semibold text-slate-800"><Users className="h-5 w-5 text-sky-500" /> Perbandingan Antar Unit / Program</h3>
        {perUnit.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={perUnit} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="unit" angle={-25} textAnchor="end" interval={0} height={60} tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rata_jpl" name="Rata-rata JPL" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="rata_sertifikat" name="Rata-rata Sertifikat" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Unit / Program</th><th className="px-4 py-3">Jumlah Pegawai</th><th className="px-4 py-3">Rata-rata JPL</th><th className="px-4 py-3">Rata-rata Sertifikat</th><th className="px-4 py-3">Memenuhi Target</th></tr></thead>
            <tbody className="divide-y divide-slate-100" data-testid="unit-table">
              {d.per_unit.map((u) => (
                <tr key={u.unit} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.unit}</td>
                  <td className="px-4 py-3 text-slate-600">{u.jumlah}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{u.rata_jpl}</td>
                  <td className="px-4 py-3 text-slate-600">{u.rata_sertifikat}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{u.memenuhi} pegawai</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
