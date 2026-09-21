import { useEffect, useState } from "react";
import api, { apiErr } from "@/lib/api";
import { PageHeader, Empty, Badge, BULAN } from "@/components/common";
import { Save, Calculator } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const now = new Date();

export default function InputSPM() {
  const [indicators, setIndicators] = useState([]);
  const [form, setForm] = useState({ indicator_id: "", bulan: now.getMonth() + 1, tahun: now.getFullYear(), numerator: "", denominator: "", target: 100, masalah: "", analisis: "", tindak_lanjut: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/indicators").then((r) => { setIndicators(r.data); if (r.data[0]) setForm((f) => ({ ...f, indicator_id: r.data[0].id, target: r.data[0].target })); }); }, []);

  const capaian = form.denominator > 0 ? Math.round((form.numerator / form.denominator) * 100 * 100) / 100 : 0;
  const ratio = form.target > 0 ? (capaian / form.target) * 100 : 0;
  const status = ratio >= 100 ? "hijau" : ratio >= 80 ? "kuning" : "merah";

  const onIndicator = (id) => { const ind = indicators.find((i) => i.id === id); setForm({ ...form, indicator_id: id, target: ind?.target || 100 }); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.indicator_id) { toast.error("Pilih indikator"); return; }
    setSaving(true);
    try {
      const res = await api.post("/reports", { ...form, numerator: Number(form.numerator), denominator: Number(form.denominator), target: Number(form.target), bulan: Number(form.bulan), tahun: Number(form.tahun) });
      toast.success(`Data tersimpan. Capaian ${res.data.capaian}% (${res.data.status.toUpperCase()})`);
      setForm({ ...form, numerator: "", denominator: "", masalah: "", analisis: "", tindak_lanjut: "" });
    } catch (er) { toast.error(apiErr(er)); } finally { setSaving(false); }
  };

  if (indicators.length === 0) return (<div><PageHeader title="Input Data SPM" /><Empty text="Belum ada indikator. Tambahkan indikator di menu Program & Indikator." /></div>);

  return (
    <div className="space-y-6">
      <PageHeader title="Formulir Input Data SPM" desc="Input data capaian indikator kesehatan secara terpadu (satu pintu)." />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Indikator</label>
            <select data-testid="report-indicator" value={form.indicator_id} onChange={(e) => onIndicator(e.target.value)} className={inputCls}>
              {indicators.map((i) => <option key={i.id} value={i.id}>{i.nama_program} — {i.nama_indikator}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Bulan</label><select data-testid="report-bulan" value={form.bulan} onChange={(e) => setForm({ ...form, bulan: e.target.value })} className={inputCls}>{BULAN.slice(1).map((b, i) => <option key={i} value={i + 1}>{b}</option>)}</select></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Tahun</label><input data-testid="report-tahun" type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Target (%)</label><input data-testid="report-target" type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Numerator (capaian)</label><input data-testid="report-numerator" type="number" required value={form.numerator} onChange={(e) => setForm({ ...form, numerator: e.target.value })} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Denominator (sasaran)</label><input data-testid="report-denominator" type="number" required value={form.denominator} onChange={(e) => setForm({ ...form, denominator: e.target.value })} className={inputCls} /></div>
          </div>
          <div><label className="mb-1 block text-xs font-semibold text-slate-600">Masalah / Hambatan</label><textarea value={form.masalah} onChange={(e) => setForm({ ...form, masalah: e.target.value })} rows={2} className={inputCls} /></div>
          <div><label className="mb-1 block text-xs font-semibold text-slate-600">Analisis Masalah</label><textarea value={form.analisis} onChange={(e) => setForm({ ...form, analisis: e.target.value })} rows={2} className={inputCls} /></div>
          <div><label className="mb-1 block text-xs font-semibold text-slate-600">Tindak Lanjut</label><textarea value={form.tindak_lanjut} onChange={(e) => setForm({ ...form, tindak_lanjut: e.target.value })} rows={2} className={inputCls} /></div>
          <button data-testid="report-submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Data"}</button>
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-3 flex items-center gap-2 font-heading font-semibold text-slate-800"><Calculator className="h-5 w-5 text-teal-500" /> Perhitungan Otomatis</h3>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Capaian</p>
              <p className="font-heading text-4xl font-extrabold text-slate-900" data-testid="calc-capaian">{capaian}%</p>
              <p className="text-xs text-slate-400">dari target {form.target}%</p>
            </div>
            <div className="text-center"><Badge type="spm" value={status} /></div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${status === "hijau" ? "bg-emerald-500" : status === "kuning" ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-400">Persentase dihitung otomatis: (Numerator / Denominator) × 100.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
