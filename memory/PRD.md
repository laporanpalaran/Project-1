# PRD — E-SPAK (Elektronik Sistem Pemantauan Kinerja dan Analisis Kesehatan)

## Problem Statement
Web app responsif untuk Puskesmas Palaran untuk digitalisasi monitoring kinerja pegawai (JPL & sertifikat) dan pemantauan capaian program kesehatan (SPM), plus dashboard pimpinan, Early Warning System, dan Policy Brief. UI Bahasa Indonesia.

## Architecture
- Frontend: React 19 + React Router + Tailwind + shadcn/ui + Recharts + sonner. Token JWT disimpan di localStorage (`espak_token`).
- Backend: FastAPI (single `server.py` + `seed.py`), semua route prefix `/api`. Auth JWT (bcrypt), RBAC via `require_roles`.
- DB: MongoDB (UUID string `id`, bukan `_id`). Datetime disimpan ISO string.
- File: Emergent Object Storage (sertifikat PDF/JPG/PNG maks 2MB).

## User Personas / Roles
- **admin**: akses penuh (pengguna, program/indikator, verifikasi, target, audit log, export).
- **kepala** (Kepala Puskesmas): dashboard eksekutif, monitoring pegawai/JPL/SPM, EWS, policy brief, laporan.
- **pegawai**: dashboard pribadi, upload & pantau sertifikat/JPL.
- **pj_program**: input indikator SPM & laporan, monitoring SPM, EWS, policy brief.

## Core Requirements (static)
- Target kompetensi default 40 JPL + 8 sertifikat (dapat diubah admin).
- Status pegawai: BELUM_MULAI / DALAM_PROSES / MEMENUHI_JPL / MEMENUHI_JPL_DAN_SERTIFIKAT (JPL dihitung dari sertifikat berstatus disetujui).
- Status indikator SPM: hijau (≥100% target) / kuning (80–99%) / merah (<80%). Capaian = numerator/denominator×100.
- Persentase boleh >100%.

## Implemented (2026-06)
- Auth JWT login via username/NIP + password; seed idempoten (admin=laporanpalaran@gmail.com).
- Dashboard admin/kepala (8 stat cards, JPL/bulan, ranking, distribusi status, ringkasan SPM & EWS) + dashboard pegawai (progress bar, kekurangan otomatis).
- Modul upload sertifikat (validasi format/2MB, object storage) + verifikasi (setuju/tolak wajib alasan) + notifikasi.
- Monitoring pegawai (tabel + filter + search + export CSV).
- Program & indikator CRUD, input data SPM terpadu (kalkulasi otomatis), monitoring SPM (bar/line/doughnut + filter bulan/tahun/program).
- Early Warning System (rule-based), Policy Brief (generate rule-based + manual + cetak PDF).
- Pengaturan: target kompetensi, manajemen pengguna, audit log. Roadmap 1 tahun. Export CSV (pegawai & SPM).
- Testing: backend 23/23 pytest passed; frontend flows 100% (setelah perbaikan useEffect).

## Backlog / Remaining
- P1: Export Excel/PDF native (saat ini CSV + cetak browser); date picker shadcn Calendar.
- P1: Analisis tren pegawai lanjutan (median chart, perbandingan antar unit).
- P2: Split server.py ke beberapa router; async storage (httpx); aggregation untuk hindari N+1.
- P2: Integrasi Google Spreadsheet/Looker Studio connector nyata.

## Next Tasks
- Tambah laporan Excel/PDF berformat resmi.
- Grafik analitik pegawai tambahan (top/bottom, per unit).
