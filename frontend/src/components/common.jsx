import { cn } from "@/lib/utils";

export const ROLE_LABEL = {
  admin: "Administrator",
  kepala: "Kepala Puskesmas",
  pegawai: "Pegawai",
  pj_program: "PJ Program",
};

export const BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const COMP_STATUS = {
  BELUM_MULAI: { label: "Belum Mulai", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  DALAM_PROSES: { label: "Dalam Proses", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  MEMENUHI_JPL: { label: "Memenuhi JPL", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  MEMENUHI_JPL_DAN_SERTIFIKAT: { label: "Memenuhi Target", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const CERT_STATUS = {
  menunggu: { label: "Menunggu Verifikasi", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  disetujui: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ditolak: { label: "Ditolak", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const SPM_STATUS = {
  hijau: { label: "Tercapai", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  kuning: { label: "Perlu Perhatian", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  merah: { label: "Di Bawah Target", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function Badge({ type, value, className }) {
  const map = type === "cert" ? CERT_STATUS : type === "spm" ? SPM_STATUS : COMP_STATUS;
  const s = map[value] || { label: value, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  return (
    <span data-testid={`badge-${value}`} className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", s.cls, className)}>
      {s.label}
    </span>
  );
}

export function StatCard({ label, value, sub, icon: Icon, tone = "sky", testid }) {
  const tones = {
    sky: "from-sky-500 to-cyan-500 text-white",
    emerald: "from-emerald-500 to-teal-500 text-white",
    amber: "from-amber-500 to-orange-500 text-white",
    rose: "from-rose-500 to-red-500 text-white",
    slate: "from-slate-700 to-slate-900 text-white",
    indigo: "from-indigo-500 to-blue-500 text-white",
  };
  return (
    <div data-testid={testid} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br shadow-sm", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function Progress({ value, target, unit = "", testid }) {
  const pct = target ? Math.round((value / target) * 100) : 0;
  const done = value >= target;
  const width = Math.min(pct, 100);
  return (
    <div data-testid={testid}>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          {value} / {target} {unit}
        </span>
        <span className={cn("font-bold", done ? "text-emerald-600" : "text-sky-600")}>{pct}%{done ? " – TERCAPAI" : ""}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all duration-700", done ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-sky-500 to-cyan-500")}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function PageHeader({ title, desc, children }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Empty({ text = "Belum ada data" }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-400">{text}</div>;
}
