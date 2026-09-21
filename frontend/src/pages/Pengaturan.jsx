import { useEffect, useState } from "react";
import api, { apiErr, API } from "@/lib/api";
import { PageHeader, Empty, ROLE_LABEL } from "@/components/common";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Target, Users, ScrollText, Save, Plus, Trash2, Pencil, Database, Download, Upload, FileSpreadsheet, FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const ROLES = ["admin", "kepala", "pegawai", "pj_program"];
const emptyUser = { username: "", nip: "", password: "", nama: "", role: "pegawai", jabatan: "", unit: "" };

function TargetTab() {
  const [s, setS] = useState({ target_jpl: 40, target_sertifikat: 8 });
  useEffect(() => { api.get("/settings").then((r) => setS(r.data)); }, []);
  const save = async () => {
    try { await api.put("/settings", { target_jpl: Number(s.target_jpl), target_sertifikat: Number(s.target_sertifikat) }); toast.success("Target diperbarui. Dashboard menyesuaikan otomatis."); }
    catch (e) { toast.error(apiErr(e)); }
  };
  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 font-heading font-semibold text-slate-800"><Target className="h-5 w-5 text-sky-500" /> Target Kompetensi</h3>
      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Target JPL Minimum</label><input data-testid="target-jpl" type="number" value={s.target_jpl} onChange={(e) => setS({ ...s, target_jpl: e.target.value })} className={inputCls} /></div>
      <div><label className="mb-1 block text-xs font-semibold text-slate-600">Target Sertifikat Minimum</label><input data-testid="target-sert" type="number" value={s.target_sertifikat} onChange={(e) => setS({ ...s, target_sertifikat: e.target.value })} className={inputCls} /></div>
      <button data-testid="save-target" onClick={save} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white"><Save className="h-4 w-4" /> Simpan Target</button>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const load = () => api.get("/users").then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEdit(null); setForm(emptyUser); setOpen(true); };
  const openEdit = (u) => { setEdit(u); setForm({ ...u, password: "" }); setOpen(true); };
  const save = async (e) => {
    e.preventDefault();
    try {
      if (edit) { const body = { ...form }; if (!body.password) delete body.password; await api.put(`/users/${edit.id}`, body); toast.success("Pengguna diperbarui"); }
      else { await api.post("/users", form); toast.success("Pengguna ditambahkan"); }
      setOpen(false); load();
    } catch (er) { toast.error(apiErr(er)); }
  };
  const del = async (id) => { if (!window.confirm("Hapus pengguna?")) return; await api.delete(`/users/${id}`); load(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button data-testid="add-user" onClick={openNew} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Tambah Pengguna</button></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Username / NIP</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Unit</th><th className="px-4 py-3">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100" data-testid="users-table">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{u.nama}</p><p className="text-xs text-slate-400">{u.jabatan}</p></td>
                  <td className="px-4 py-3"><p className="text-slate-600">{u.username}</p><p className="font-mono text-xs text-slate-400">{u.nip}</p></td>
                  <td className="px-4 py-3"><span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{ROLE_LABEL[u.role]}</span></td>
                  <td className="px-4 py-3 text-slate-500">{u.unit || "-"}</td>
                  <td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={() => openEdit(u)} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => del(u.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="font-heading">{edit ? "Edit" : "Tambah"} Pengguna</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <input required placeholder="Nama Lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className={inputCls} data-testid="u-nama" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputCls} data-testid="u-username" />
              <input placeholder="NIP" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} className={inputCls} />
            </div>
            <input type="password" placeholder={edit ? "Kata sandi (kosongkan jika tetap)" : "Kata Sandi"} required={!edit} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} data-testid="u-password" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} data-testid="u-role">{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
              <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls} />
            </div>
            <input placeholder="Jabatan" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} className={inputCls} />
            <DialogFooter><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm">Batal</button><button data-testid="u-submit" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">Simpan</button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get("/audit-logs").then((r) => setLogs(r.data)); }, []);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Waktu</th><th className="px-4 py-3">Pengguna</th><th className="px-4 py-3">Aktivitas</th><th className="px-4 py-3">Modul</th></tr></thead>
          <tbody className="divide-y divide-slate-100" data-testid="audit-table">
            {logs.length === 0 && <tr><td colSpan={4} className="p-8"><Empty /></td></tr>}
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{new Date(l.created_at).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-slate-700">{l.user_nama || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{l.aktivitas}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{l.module}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BackupTab() {
  const token = localStorage.getItem("espak_token");
  const [restoring, setRestoring] = useState(false);
  const [mode, setMode] = useState("merge");

  const dl = (path) => window.open(`${API}${path}${path.includes("?") ? "&" : "?"}auth=${token}`, "_blank");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const info = mode === "replace" ? "MENGGANTI (menghapus) seluruh data lama" : "menggabungkan dengan data yang ada";
    if (!window.confirm(`Pulihkan backup ini?\n\nMode "${mode}" akan ${info}.\nLanjutkan?`)) { e.target.value = ""; return; }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);
    setRestoring(true);
    try {
      const r = await api.post("/backup/import", fd);
      const total = Object.values(r.data.restored || {}).reduce((a, b) => a + Number(b), 0);
      toast.success(`Backup dipulihkan (${total} data, mode ${r.data.mode}). Muat ulang halaman untuk melihat perubahan.`);
    } catch (er) { toast.error(apiErr(er)); }
    finally { setRestoring(false); e.target.value = ""; }
  };

  const btn = "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600"><Database className="h-5 w-5" /></div>
          <div><h3 className="font-heading font-semibold text-slate-800">Backup Penuh (JSON)</h3><p className="text-xs text-slate-500">Seluruh data sistem dalam satu berkas yang dapat dipulihkan kembali.</p></div>
        </div>
        <button data-testid="dl-backup-json" onClick={() => dl("/backup/export")} className={`${btn} bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg hover:opacity-95`}><Download className="h-4 w-4" /> Unduh Backup JSON</button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><FileSpreadsheet className="h-5 w-5" /></div>
          <div><h3 className="font-heading font-semibold text-slate-800">Ekspor Excel</h3><p className="text-xs text-slate-500">Workbook berisi sheet Pengguna, Program, Indikator & Capaian SPM.</p></div>
        </div>
        <button data-testid="dl-backup-xlsx" onClick={() => dl("/backup/excel")} className={`${btn} bg-emerald-600 text-white shadow hover:bg-emerald-700`}><Download className="h-4 w-4" /> Unduh Excel (.xlsx)</button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><FileText className="h-5 w-5" /></div>
          <div><h3 className="font-heading font-semibold text-slate-800">Ekspor CSV per Data</h3><p className="text-xs text-slate-500">Arsip terpisah untuk data pengguna dan capaian SPM.</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button data-testid="dl-csv-users" onClick={() => dl("/backup/csv?dataset=users")} className={`${btn} border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}><Download className="h-4 w-4" /> CSV Pengguna</button>
          <button data-testid="dl-csv-spm" onClick={() => dl("/backup/csv?dataset=spm")} className={`${btn} border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}><Download className="h-4 w-4" /> CSV Capaian SPM</button>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-600"><Upload className="h-5 w-5" /></div>
          <div><h3 className="font-heading font-semibold text-slate-800">Pulihkan dari Backup (JSON)</h3><p className="text-xs text-slate-500">Unggah berkas backup JSON untuk memulihkan data.</p></div>
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Mode Pemulihan</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className={inputCls} data-testid="restore-mode">
            <option value="merge">Gabung (perbarui/tambah, data lain tetap)</option>
            <option value="replace">Ganti Total (hapus dulu lalu isi ulang)</option>
          </select>
        </div>
        <label className={`${btn} w-fit cursor-pointer bg-rose-600 text-white shadow hover:bg-rose-700 ${restoring ? "pointer-events-none opacity-60" : ""}`}>
          <RotateCcw className="h-4 w-4" /> {restoring ? "Memulihkan..." : "Pilih Berkas & Pulihkan"}
          <input type="file" accept="application/json,.json" className="hidden" onChange={onFile} data-testid="restore-file" disabled={restoring} />
        </label>
      </div>
    </div>
  );
}

export default function Pengaturan() {  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan Sistem" desc="Kelola target kompetensi, pengguna, dan audit log aktivitas." />
      <Tabs defaultValue="target">
        <TabsList>
          <TabsTrigger value="target" data-testid="tab-target"><Target className="mr-1.5 h-4 w-4" /> Target</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users"><Users className="mr-1.5 h-4 w-4" /> Pengguna</TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit"><ScrollText className="mr-1.5 h-4 w-4" /> Audit Log</TabsTrigger>
          <TabsTrigger value="backup" data-testid="tab-backup"><Database className="mr-1.5 h-4 w-4" /> Backup</TabsTrigger>
        </TabsList>
        <TabsContent value="target" className="mt-4"><TargetTab /></TabsContent>
        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="audit" className="mt-4"><AuditTab /></TabsContent>
        <TabsContent value="backup" className="mt-4"><BackupTab /></TabsContent>
      </Tabs>
    </div>
  );
}
