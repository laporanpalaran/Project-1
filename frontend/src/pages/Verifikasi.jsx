import { useEffect, useState } from "react";
import api, { apiErr, fileUrl } from "@/lib/api";
import { Badge, PageHeader, Empty } from "@/components/common";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

const FILTERS = [["", "Semua"], ["menunggu", "Menunggu"], ["disetujui", "Disetujui"], ["ditolak", "Ditolak"]];

export default function Verifikasi() {
  const [certs, setCerts] = useState([]);
  const [filter, setFilter] = useState("");
  const [reject, setReject] = useState(null);
  const [alasan, setAlasan] = useState("");

  const load = () => api.get("/certificates", { params: filter ? { status: filter } : {} }).then((r) => setCerts(r.data));
  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    try { await api.put(`/certificates/${id}/verify`, { status: "disetujui", catatan: "" }); toast.success("Sertifikat disetujui"); load(); }
    catch (e) { toast.error(apiErr(e)); }
  };
  const doReject = async () => {
    if (!alasan.trim()) { toast.error("Alasan penolakan wajib diisi"); return; }
    try { await api.put(`/certificates/${reject.id}/verify`, { status: "ditolak", catatan: alasan }); toast.success("Sertifikat ditolak"); setReject(null); setAlasan(""); load(); }
    catch (e) { toast.error(apiErr(e)); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Verifikasi Sertifikat" desc="Tinjau dan verifikasi sertifikat yang diunggah pegawai." />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([v, l]) => (
          <button key={v} data-testid={`vfilter-${v || "all"}`} onClick={() => setFilter(v)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === v ? "bg-sky-500 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{l}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Pegawai</th><th className="px-4 py-3">Pelatihan</th><th className="px-4 py-3">JPL</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">File</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100" data-testid="verif-table">
              {certs.length === 0 && <tr><td colSpan={7} className="p-8"><Empty /></td></tr>}
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{c.employee_nama}</p><p className="font-mono text-xs text-slate-400">{c.employee_nip}</p></td>
                  <td className="px-4 py-3"><p className="text-slate-700">{c.nama_pelatihan}</p><p className="text-xs text-slate-400">{c.penyelenggara}</p></td>
                  <td className="px-4 py-3 font-semibold">{c.jpl}</td>
                  <td className="px-4 py-3 text-slate-500">{c.tanggal_pelatihan || "-"}</td>
                  <td className="px-4 py-3">{c.storage_path ? <a href={fileUrl(c.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" /></a> : <FileText className="h-4 w-4 text-slate-300" />}</td>
                  <td className="px-4 py-3"><Badge type="cert" value={c.status} /></td>
                  <td className="px-4 py-3">
                    {c.status === "menunggu" ? (
                      <div className="flex gap-1.5">
                        <button data-testid={`approve-${c.id}`} onClick={() => approve(c.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check className="h-4 w-4" /></button>
                        <button data-testid={`reject-${c.id}`} onClick={() => setReject(c)} className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"><X className="h-4 w-4" /></button>
                      </div>
                    ) : <span className="text-xs text-slate-400">{c.verified_by}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!reject} onOpenChange={(o) => !o && setReject(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Tolak Sertifikat</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Berikan alasan penolakan untuk sertifikat <b>{reject?.nama_pelatihan}</b>.</p>
          <textarea data-testid="reject-reason" value={alasan} onChange={(e) => setAlasan(e.target.value)} rows={3} placeholder="Contoh: Dokumen tidak terbaca / JPL tidak sesuai" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400" />
          <DialogFooter>
            <button onClick={() => setReject(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Batal</button>
            <button data-testid="reject-confirm" onClick={doReject} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Tolak Sertifikat</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
