import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api, { apiErr } from "@/lib/api";
import { PageHeader, Empty } from "@/components/common";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Plus, FileDown, ScrollText, Trash2 } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const STATUS_CLS = {
  "Belum Ditindaklanjuti": "bg-rose-50 text-rose-700 border-rose-200",
  "Dalam Proses": "bg-amber-50 text-amber-700 border-amber-200",
  "Selesai": "bg-emerald-50 text-emerald-700 border-emerald-200",
};
const empty = { periode: "", masalah: "", analisis: "", dampak: "", rekomendasi: "", penanggung_jawab: "", target_penyelesaian: "", status: "Belum Ditindaklanjuti" };

export default function PolicyBrief() {
  const { user } = useAuth();
  const [briefs, setBriefs] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/policy-briefs").then((r) => setBriefs(r.data));
  useEffect(() => { load(); }, []);

  const generate = async () => {
    try { const { data } = await api.post("/policy-briefs/generate"); setForm(data); setOpen(true); toast.success("Draft policy brief dibuat otomatis dari data SPM."); }
    catch (e) { toast.error(apiErr(e)); }
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.post("/policy-briefs", form); toast.success("Policy brief disimpan"); setOpen(false); setForm(empty); load(); }
    catch (er) { toast.error(apiErr(er)); } finally { setSaving(false); }
  };
  const del = async (id) => { if (!window.confirm("Hapus policy brief?")) return; await api.delete(`/policy-briefs/${id}`); load(); };

  return (
    <div className="space-y-6">
      <PageHeader title="Policy Brief" desc="Ringkasan manajemen: masalah, analisis, dampak, rekomendasi & tindak lanjut.">
        <button data-testid="generate-brief" onClick={generate} className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-100"><Sparkles className="h-4 w-4" /> Generate Otomatis</button>
        <button data-testid="new-brief" onClick={() => { setForm(empty); setOpen(true); }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"><Plus className="h-4 w-4" /> Buat Manual</button>
      </PageHeader>

      {briefs.length === 0 && <Empty text="Belum ada policy brief" />}
      <div className="grid gap-4 lg:grid-cols-2">
        {briefs.map((b) => (
          <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-100 text-indigo-600"><ScrollText className="h-5 w-5" /></span>
                <div><p className="font-heading font-semibold text-slate-800">Policy Brief {b.periode}</p><p className="text-xs text-slate-400">Oleh {b.dibuat_oleh || "-"}</p></div>
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[b.status] || ""}`}>{b.status}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-600"><b>Masalah:</b> {b.masalah}</p>
            <div className="mt-4 flex gap-2">
              <button data-testid={`view-brief-${b.id}`} onClick={() => setView(b)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">Lihat Detail</button>
              {["admin", "kepala"].includes(user.role) && <button onClick={() => del(b.id)} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Policy Brief</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <input required placeholder="Periode (cth: 06-2026)" value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })} className={inputCls} data-testid="brief-periode" />
            <Text label="Masalah Utama" v={form.masalah} on={(x) => setForm({ ...form, masalah: x })} req />
            <Text label="Analisis" v={form.analisis} on={(x) => setForm({ ...form, analisis: x })} req />
            <Text label="Dampak" v={form.dampak} on={(x) => setForm({ ...form, dampak: x })} />
            <Text label="Rekomendasi" v={form.rekomendasi} on={(x) => setForm({ ...form, rekomendasi: x })} req />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Penanggung Jawab" value={form.penanggung_jawab} onChange={(e) => setForm({ ...form, penanggung_jawab: e.target.value })} className={inputCls} />
              <input placeholder="Target Penyelesaian" value={form.target_penyelesaian} onChange={(e) => setForm({ ...form, target_penyelesaian: e.target.value })} className={inputCls} />
            </div>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>{Object.keys(STATUS_CLS).map((s) => <option key={s}>{s}</option>)}</select>
            <DialogFooter><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm">Batal</button><button data-testid="brief-save" disabled={saving} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Simpan</button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Policy Brief {view?.periode}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-3 text-sm" id="brief-print">
              {[["1. Masalah Utama", view.masalah], ["2. Analisis", view.analisis], ["3. Dampak", view.dampak], ["4. Rekomendasi", view.rekomendasi], ["5. Penanggung Jawab", view.penanggung_jawab], ["6. Target Penyelesaian", view.target_penyelesaian], ["7. Status", view.status]].map(([t, v]) => (
                <div key={t}><p className="font-heading font-semibold text-slate-800">{t}</p><p className="text-slate-600">{v || "-"}</p></div>
              ))}
            </div>
          )}
          <DialogFooter><button data-testid="brief-export" onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white"><FileDown className="h-4 w-4" /> Export / Cetak PDF</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Text({ label, v, on, req }) {
  return <div><label className="mb-1 block text-xs font-semibold text-slate-600">{label}{req && <span className="text-rose-500"> *</span>}</label><textarea required={req} value={v} onChange={(e) => on(e.target.value)} rows={2} className={inputCls} /></div>;
}
