import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatCard, PageHeader, Empty, BULAN } from "@/components/common";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { UserCheck, UserX, Clock, Target } from "lucide-react";

export default function MonitoringJPL() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/dashboard/stats").then((r) => setD(r.data)); }, []);
  if (!d) return <Empty text="Memuat..." />;
  const c = d.cards;
  const target = d.settings.target_jpl;
  const rankData = d.ranking.map((r) => ({ nama: r.nama.split(",")[0].split(" ").slice(0, 2).join(" "), jpl: r.total_jpl }));
  const monthly = d.jpl_monthly.map((m) => { const [y, mm] = m.bulan.split("-"); return { label: `${BULAN[parseInt(mm)].slice(0, 3)} ${y.slice(2)}`, jpl: m.jpl }; });

  return (
    <div className="space-y-6">
      <PageHeader title="Monitoring JPL" desc={`Distribusi & ranking Jam Pelajaran pegawai · Target ${target} JPL`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total JPL" value={c.total_jpl} icon={Clock} tone="sky" />
        <StatCard label="Rata-rata JPL" value={d.avg_jpl} sub={`Median ${d.median_jpl}`} icon={Target} tone="indigo" />
        <StatCard label="Capai 40 JPL" value={c.memenuhi_jpl} icon={UserCheck} tone="emerald" />
        <StatCard label="JPL < 40" value={c.belum_memenuhi_jpl} icon={UserX} tone="amber" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-heading font-semibold text-slate-800">Ranking Pegawai berdasarkan JPL</h3>
        {rankData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={rankData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis type="category" dataKey="nama" width={110} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="jpl" radius={[0, 6, 6, 0]}>
                {rankData.map((e, i) => <Cell key={i} fill={e.jpl >= target ? "#10b981" : "#0ea5e9"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-heading font-semibold text-slate-800">Tren Penambahan JPL per Bulan</h3>
        {monthly.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="jpl" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
