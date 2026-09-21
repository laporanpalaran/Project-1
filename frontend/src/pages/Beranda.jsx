import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { StatCard, Progress, Badge, PageHeader, Empty } from "@/components/common";
import {
  Users, UserCheck, UserX, Award, Clock, Target, ListChecks, Activity,
  AlertTriangle, CheckCircle2, Trophy, Calendar,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

function PeriodeSelect({ tahun, setTahun, options }) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-slate-400" />
      <select data-testid="periode-select" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
        {options.map((y) => <option key={y} value={y}>Periode {y}</option>)}
      </select>
    </div>
  );
}

function PegawaiHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [certs, setCerts] = useState([]);
  const [tahun, setTahun] = useState(Math.max(2026, new Date().getFullYear()));
  useEffect(() => {
    api.get("/me/stats", { params: { tahun } }).then((r) => setData(r.data));
    api.get("/certificates").then((r) => setCerts(r.data));
  }, [tahun]);
  if (!data) return <Empty text="Memuat..." />;
  const { stats, settings } = data;
  const periodeOptions = data.periode_options || [tahun];
  const done = stats.status === "MEMENUHI_JPL_DAN_SERTIFIKAT";
  return (
    <div className="space-y-6">
      <PageHeader title={`Selamat Datang, ${user.nama.split(",")[0]}`} desc="Ringkasan pencapaian pengembangan kompetensi Anda per periode.">
        <PeriodeSelect tahun={tahun} setTahun={setTahun} options={periodeOptions} />
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard testid="stat-jpl" label="Total JPL" value={stats.total_jpl} sub={`Target ${settings.target_jpl} JPL`} icon={Clock} tone="sky" />
        <StatCard testid="stat-sertifikat" label="Total Sertifikat" value={stats.total_sertifikat} sub={`Target ${settings.target_sertifikat} sertifikat`} icon={Award} tone="emerald" />
        <StatCard testid="stat-persen" label="Progres JPL" value={`${stats.persen_jpl}%`} sub="dari target JPL" icon={Target} tone="indigo" />
        <StatCard testid="stat-status" label="Status" value={<Badge value={stats.status} />} icon={CheckCircle2} tone={done ? "emerald" : "amber"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-heading font-semibold text-slate-800">Progres Target Kompetensi</h3>
          <div className="space-y-5">
            <Progress testid="progress-jpl" value={stats.total_jpl} target={settings.target_jpl} unit="JPL" />
            <Progress testid="progress-sertifikat" value={stats.total_sertifikat} target={settings.target_sertifikat} unit="Sertifikat" />
          </div>
          <div className={`mt-5 rounded-xl border p-4 text-sm ${done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-sky-200 bg-sky-50 text-sky-700"}`} data-testid="progress-message">
            {done
              ? "Selamat, target pengembangan kompetensi telah terpenuhi."
              : `Masih membutuhkan ${stats.kurang_jpl} JPL dan ${stats.kurang_sertifikat} sertifikat lagi untuk memenuhi target.`}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading font-semibold text-slate-800">Sertifikat Terbaru</h3>
            <a href="/sertifikat" className="text-sm font-medium text-sky-600 hover:underline">Kelola →</a>
          </div>
          {certs.length === 0 ? <Empty text="Belum ada sertifikat" /> : (
            <div className="space-y-2.5">
              {certs.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{c.nama_pelatihan}</p>
                    <p className="text-xs text-slate-400">{c.jpl} JPL · {c.penyelenggara}</p>
                  </div>
                  <Badge type="cert" value={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DONUT = ["#94a3b8", "#f59e0b", "#0ea5e9", "#10b981"];

function AdminHome() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [spm, setSpm] = useState(null);
  const [ews, setEws] = useState(null);
  const [tahun, setTahun] = useState(Math.max(2026, new Date().getFullYear()));
  useEffect(() => {
    const bulan = new Date().getMonth() + 1;
    api.get("/dashboard/stats", { params: { tahun } }).then((r) => setD(r.data));
    api.get("/spm/dashboard", { params: { bulan, tahun } }).then((r) => setSpm(r.data));
    api.get("/ews").then((r) => setEws(r.data)).catch(() => {});
  }, [tahun]);
  if (!d) return <Empty text="Memuat dashboard..." />;
  const c = d.cards;
  const dist = d.distribusi_status;
  const donutData = [
    { name: "Belum Mulai", value: dist.belum_mulai },
    { name: "Dalam Proses", value: dist.dalam_proses },
    { name: "Memenuhi JPL", value: dist.memenuhi_jpl },
    { name: "Memenuhi Target", value: dist.memenuhi_semua },
  ];
  const yearly = (d.jpl_yearly || []).map((y) => ({ label: String(y.tahun), jpl: y.jpl, sertifikat: y.sertifikat }));
  const periodeOptions = d.periode_options || [tahun];

  return (
    <div className="space-y-6">
      <PageHeader title="Selamat Datang di E-SPAK" desc={`Monitoring kinerja pegawai & capaian SPM · Periode ${tahun}${user.jabatan ? " · " + user.jabatan : ""}`}>
        <PeriodeSelect tahun={tahun} setTahun={setTahun} options={periodeOptions} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard testid="card-total-pegawai" label="Total Pegawai" value={c.total_pegawai} icon={Users} tone="sky" />
        <StatCard testid="card-memenuhi-jpl" label="Memenuhi 40 JPL" value={c.memenuhi_jpl} sub={`${c.persen_memenuhi_target}% memenuhi target penuh`} icon={UserCheck} tone="emerald" />
        <StatCard testid="card-belum-jpl" label="Belum Memenuhi JPL" value={c.belum_memenuhi_jpl} icon={UserX} tone="amber" />
        <StatCard testid="card-total-sertifikat" label="Total Sertifikat" value={c.total_sertifikat} icon={Award} tone="indigo" />
        <StatCard testid="card-total-jpl" label="Total JPL Terkumpul" value={c.total_jpl} sub={`Rata-rata ${d.avg_jpl} · Median ${d.median_jpl}`} icon={Clock} tone="sky" />
        <StatCard testid="card-persen-target" label="Pegawai Memenuhi Target" value={`${c.persen_memenuhi_target}%`} icon={Target} tone="emerald" />
        <StatCard testid="card-program" label="Jumlah Program" value={c.total_program} icon={ListChecks} tone="slate" />
        <StatCard testid="card-indikator" label="Indikator SPM" value={c.total_indikator} icon={Activity} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 font-heading font-semibold text-slate-800">Total JPL & Sertifikat per Periode (Tahun)</h3>
          {yearly.length === 0 ? <Empty text="Belum ada data capaian JPL. Data muncul setelah sertifikat disetujui." /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="jpl" name="Total JPL" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sertifikat" name="Total Sertifikat" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-heading font-semibold text-slate-800">Distribusi Status Pegawai</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {donutData.map((e, i) => <Cell key={i} fill={DONUT[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {donutData.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT[i] }} />{e.name}</span>
                <span className="font-semibold text-slate-800">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-heading font-semibold text-slate-800"><Trophy className="h-5 w-5 text-amber-500" />Ranking Pegawai (Top JPL)</h3>
          <div className="space-y-2">
            {d.ranking.slice(0, 6).map((r, i) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i < 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                <span className="w-40 shrink-0 truncate text-sm font-medium text-slate-700">{r.nama}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500" style={{ width: `${Math.min(r.persen_jpl, 100)}%` }} />
                </div>
                <span className="w-14 shrink-0 text-right text-sm font-bold text-slate-800">{r.total_jpl}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {spm && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="mb-3 flex items-center gap-2 font-heading font-semibold text-slate-800"><Activity className="h-5 w-5 text-teal-500" />Capaian SPM</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 p-3"><p className="text-2xl font-extrabold text-emerald-600">{spm.summary.hijau}</p><p className="text-xs text-emerald-700">Tercapai</p></div>
                <div className="rounded-xl bg-amber-50 p-3"><p className="text-2xl font-extrabold text-amber-600">{spm.summary.kuning}</p><p className="text-xs text-amber-700">Waspada</p></div>
                <div className="rounded-xl bg-rose-50 p-3"><p className="text-2xl font-extrabold text-rose-600">{spm.summary.merah}</p><p className="text-xs text-rose-700">Kritis</p></div>
              </div>
            </div>
          )}
          {ews && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6">
              <h3 className="mb-2 flex items-center gap-2 font-heading font-semibold text-rose-700"><AlertTriangle className="h-5 w-5" />Early Warning</h3>
              <p className="text-sm text-rose-600">{ews.counts.merah} peringatan kritis · {ews.counts.kuning} waspada</p>
              <p className="mt-1 text-sm text-slate-600">{ews.counts.pegawai_belum} pegawai belum capai target JPL · {ews.counts.belum_upload} belum upload sertifikat.</p>
              <a href="/ews" className="mt-3 inline-block text-sm font-semibold text-rose-700 hover:underline">Lihat semua peringatan →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Beranda() {
  const { user } = useAuth();
  return user.role === "pegawai" ? <PegawaiHome /> : <AdminHome />;
}
