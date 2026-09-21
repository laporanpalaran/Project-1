import { useEffect, useState } from "react";
import api, { apiErr, fileUrl } from "@/lib/api";
import { Badge, PageHeader, Empty, Progress } from "@/components/common";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Upload, FileText, Trash2, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";

const JENIS = ["Teknis", "Fungsional", "Manajerial", "Seminar", "Workshop", "Soft Skill", "Lainnya"];

export default function Sertifikat() {
  const [certs, setCerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama_pelatihan: "", jenis_pelatihan: "Teknis", penyelenggara: "", nomor_sertifikat: "", tanggal_pelatihan: "", jpl: "", keterangan: "" });
  const [file, setFile] = useState(null);

  const load = () => {
    api.get("/certificates").then((r) => setCerts(r.data));
    api.get("/me/stats").then((r) => setStats(r.data));
  };
  useEffect(load, []);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "jpg", "jpeg", "png"].includes(ext)) { toast.error("Format tidak diizinkan. Gunakan PDF, JPG, JPEG, atau PNG."); e.target.value = ""; return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Ukuran file melebihi 2 MB. Silakan kompres file Anda."); e.target.value = ""; return; }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("File sertifikat wajib diunggah."); return; }
    if (!form.jpl || Number(form.jpl) <= 0) { toast.error("Jumlah JPL harus lebih dari 0."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", file);
      await api.post("/certificates", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Sertifikat berhasil diunggah. Status: Menunggu Verifikasi.");
      setOpen(false);
      setForm({ nama_pelatihan: "", jenis_pelatihan: "Teknis", penyelenggara: "", nomor_sertifikat: "", tanggal_pelatihan: "", jpl: "", keterangan: "" });
      setFile(null);
      load();
    } catch (err) { toast.error(apiErr(err)); } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Hapus sertifikat ini?")) return;
    await api.delete(`/certificates/${id}`);
    toast.success("Sertifikat dihapus");
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Sertifikat & JPL" desc="Unggah sertifikat pelatihan dan pantau pencapaian JPL Anda.">
        <button data-testid="upload-cert-btn" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95">
          <Plus className="h-4 w-4" /> Upload Sertifikat
        </button>
      </PageHeader>

      {stats && (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <Progress testid="cert-progress-jpl" value={stats.stats.total_jpl} target={stats.settings.target_jpl} unit="JPL" />
          <Progress testid="cert-progress-sert" value={stats.stats.total_sertifikat} target={stats.settings.target_sertifikat} unit="Sertifikat" />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Pelatihan</th><th className="px-4 py-3">JPL</th><th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">File</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" data-testid="cert-table">
              {certs.length === 0 && <tr><td colSpan={6} className="p-8"><Empty text="Belum ada sertifikat diunggah" /></td></tr>}
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{c.nama_pelatihan}</p>
                    <p className="text-xs text-slate-400">{c.penyelenggara} · {c.jenis_pelatihan}</p>
                    {c.status === "ditolak" && c.catatan_verifikasi && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-rose-600"><Info className="h-3 w-3" /> Alasan: {c.catatan_verifikasi}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{c.jpl}</td>
                  <td className="px-4 py-3 text-slate-500">{c.tanggal_pelatihan || "-"}</td>
                  <td className="px-4 py-3">
                    {c.storage_path ? (
                      <a href={fileUrl(c.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Lihat</a>
                    ) : <span className="inline-flex items-center gap-1 text-slate-400"><FileText className="h-3.5 w-3.5" /> Demo</span>}
                  </td>
                  <td className="px-4 py-3"><Badge type="cert" value={c.status} /></td>
                  <td className="px-4 py-3">
                    {c.status !== "disetujui" && (
                      <button onClick={() => del(c.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Upload Sertifikat Pelatihan</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Nama Pelatihan" required><input data-testid="f-nama" required value={form.nama_pelatihan} onChange={(e) => setForm({ ...form, nama_pelatihan: e.target.value })} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jenis Pelatihan"><select data-testid="f-jenis" value={form.jenis_pelatihan} onChange={(e) => setForm({ ...form, jenis_pelatihan: e.target.value })} className={inputCls}>{JENIS.map((j) => <option key={j}>{j}</option>)}</select></Field>
              <Field label="Jumlah JPL" required><input data-testid="f-jpl" type="number" min="1" required value={form.jpl} onChange={(e) => setForm({ ...form, jpl: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Penyelenggara"><input data-testid="f-penyelenggara" value={form.penyelenggara} onChange={(e) => setForm({ ...form, penyelenggara: e.target.value })} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal Pelatihan"><input data-testid="f-tanggal" type="date" value={form.tanggal_pelatihan} onChange={(e) => setForm({ ...form, tanggal_pelatihan: e.target.value })} className={inputCls} /></Field>
              <Field label="Nomor Sertifikat"><input data-testid="f-nomor" value={form.nomor_sertifikat} onChange={(e) => setForm({ ...form, nomor_sertifikat: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="File Sertifikat (PDF/JPG/PNG, maks 2 MB)" required>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition hover:border-sky-400 hover:bg-sky-50">
                <Upload className="h-4 w-4" /> {file ? file.name : "Pilih file..."}
                <input data-testid="f-file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFile} className="hidden" />
              </label>
            </Field>
            <Field label="Keterangan"><textarea data-testid="f-keterangan" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className={inputCls} rows={2} /></Field>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Batal</button>
              <button data-testid="f-submit" disabled={saving} type="submit" className="rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Mengunggah..." : "Unggah"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
function Field({ label, required, children }) {
  return <div><label className="mb-1 block text-xs font-semibold text-slate-600">{label}{required && <span className="text-rose-500"> *</span>}</label>{children}</div>;
}
