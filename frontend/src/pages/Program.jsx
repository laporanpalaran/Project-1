import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api, { apiErr } from "@/lib/api";
import { PageHeader, Empty, Badge } from "@/components/common";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, ListChecks, Trash2 } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

export default function Program() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const [programs, setPrograms] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [pOpen, setPOpen] = useState(false);
  const [iOpen, setIOpen] = useState(false);
  const [pForm, setPForm] = useState({ nama_program: "", penanggung_jawab: "", status: "aktif" });
  const [iForm, setIForm] = useState({ program_id: "", nama_indikator: "", target: 100, satuan: "%" });

  const load = () => {
    api.get("/programs").then((r) => setPrograms(r.data));
    api.get("/indicators").then((r) => setIndicators(r.data));
  };
  useEffect(load, []);

  const addProgram = async (e) => {
    e.preventDefault();
    try { await api.post("/programs", pForm); toast.success("Program ditambahkan"); setPOpen(false); setPForm({ nama_program: "", penanggung_jawab: "", status: "aktif" }); load(); }
    catch (er) { toast.error(apiErr(er)); }
  };
  const addIndicator = async (e) => {
    e.preventDefault();
    try { await api.post("/indicators", { ...iForm, target: Number(iForm.target) }); toast.success("Indikator ditambahkan"); setIOpen(false); setIForm({ program_id: "", nama_indikator: "", target: 100, satuan: "%" }); load(); }
    catch (er) { toast.error(apiErr(er)); }
  };
  const delIndicator = async (id) => { if (!window.confirm("Hapus indikator?")) return; await api.delete(`/indicators/${id}`); load(); };
  const delProgram = async (id) => { if (!window.confirm("Hapus program beserta indikatornya?")) return; await api.delete(`/programs/${id}`); load(); };

  return (
    <div className="space-y-6">
      <PageHeader title="Program & Indikator SPM" desc="Kelola program kesehatan dan indikator Standar Pelayanan Minimal.">
        {isAdmin && <>
          <button data-testid="add-program-btn" onClick={() => setPOpen(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><Plus className="h-4 w-4" /> Program</button>
          <button data-testid="add-indicator-btn" onClick={() => { setIForm({ ...iForm, program_id: programs[0]?.id || "" }); setIOpen(true); }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"><Plus className="h-4 w-4" /> Indikator</button>
        </>}
      </PageHeader>

      {programs.length === 0 && <Empty text="Belum ada program" />}
      <div className="space-y-4">
        {programs.map((p) => {
          const inds = indicators.filter((i) => i.program_id === p.id);
          return (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-600"><ListChecks className="h-5 w-5" /></span>
                  <div><p className="font-heading font-semibold text-slate-800">{p.nama_program}</p><p className="text-xs text-slate-400">PJ: {p.penanggung_jawab || "-"} · {inds.length} indikator</p></div>
                </div>
                {isAdmin && <button onClick={() => delProgram(p.id)} className="text-rose-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
              <div className="divide-y divide-slate-100">
                {inds.length === 0 ? <p className="px-5 py-4 text-sm text-slate-400">Belum ada indikator</p> : inds.map((i) => (
                  <div key={i.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-slate-700">{i.nama_indikator}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Target {i.target}{i.satuan}</span>
                      {isAdmin && <button onClick={() => delIndicator(i.id)} className="text-rose-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={pOpen} onOpenChange={setPOpen}>
        <DialogContent><DialogHeader><DialogTitle className="font-heading">Tambah Program</DialogTitle></DialogHeader>
          <form onSubmit={addProgram} className="space-y-3">
            <input required placeholder="Nama Program" value={pForm.nama_program} onChange={(e) => setPForm({ ...pForm, nama_program: e.target.value })} className={inputCls} data-testid="p-nama" />
            <input placeholder="Penanggung Jawab" value={pForm.penanggung_jawab} onChange={(e) => setPForm({ ...pForm, penanggung_jawab: e.target.value })} className={inputCls} />
            <DialogFooter><button type="button" onClick={() => setPOpen(false)} className="rounded-xl border px-4 py-2 text-sm">Batal</button><button data-testid="p-submit" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">Simpan</button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={iOpen} onOpenChange={setIOpen}>
        <DialogContent><DialogHeader><DialogTitle className="font-heading">Tambah Indikator</DialogTitle></DialogHeader>
          <form onSubmit={addIndicator} className="space-y-3">
            <select required value={iForm.program_id} onChange={(e) => setIForm({ ...iForm, program_id: e.target.value })} className={inputCls} data-testid="i-program"><option value="">Pilih Program</option>{programs.map((p) => <option key={p.id} value={p.id}>{p.nama_program}</option>)}</select>
            <input required placeholder="Nama Indikator" value={iForm.nama_indikator} onChange={(e) => setIForm({ ...iForm, nama_indikator: e.target.value })} className={inputCls} data-testid="i-nama" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Target" value={iForm.target} onChange={(e) => setIForm({ ...iForm, target: e.target.value })} className={inputCls} data-testid="i-target" />
              <input placeholder="Satuan" value={iForm.satuan} onChange={(e) => setIForm({ ...iForm, satuan: e.target.value })} className={inputCls} />
            </div>
            <DialogFooter><button type="button" onClick={() => setIOpen(false)} className="rounded-xl border px-4 py-2 text-sm">Batal</button><button data-testid="i-submit" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">Simpan</button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
