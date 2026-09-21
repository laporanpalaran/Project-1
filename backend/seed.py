"""Seed demo data for E-SPAK."""
import os
import uuid
from datetime import datetime, timezone, timedelta


def now_iso():
    return datetime.now(timezone.utc).isoformat()


async def seed_data(db, hash_password):
    # ---- Users ----
    if await db.users.count_documents({}) == 0:
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@espak.id")
        admin_user = os.environ.get("ADMIN_USERNAME", "admin")
        admin_pass = os.environ.get("ADMIN_PASSWORD", "admin123")
        users = [
            {"username": admin_user, "nip": "19700101 200001 1 001", "email": admin_email,
             "password": admin_pass, "nama": "Administrator E-SPAK", "role": "admin",
             "jabatan": "Administrator Sistem", "unit": "Tata Usaha"},
            {"username": "kepala", "nip": "19780512 200312 1 004", "email": "kepala@espak.id",
             "password": "kepala123", "nama": "dr. H. Ahmad Fauzi, M.Kes", "role": "kepala",
             "jabatan": "Kepala Puskesmas", "unit": "Manajemen"},
            {"username": "pjkia", "nip": "19850321 201001 2 015", "email": "pjkia@espak.id",
             "password": "pj123", "nama": "Ns. Siti Rahmawati, S.Kep", "role": "pj_program",
             "jabatan": "Bidan Koordinator", "unit": "KIA"},
            {"username": "pjtb", "nip": "19880711 201203 1 009", "email": "pjtb@espak.id",
             "password": "pj123", "nama": "Budi Santoso, A.Md.Kep", "role": "pj_program",
             "jabatan": "Perawat P2P", "unit": "P2P"},
        ]
        nakes = [
            ("Dewi Lestari, A.Md.Keb", "Bidan", "KIA"),
            ("Rian Hidayat, S.Farm", "Apoteker", "Kefarmasian"),
            ("Maya Puspita, A.Md.Gz", "Nutrisionis", "Gizi"),
            ("Andi Wijaya, A.Md.Kep", "Perawat", "UKP"),
            ("Nur Aisyah, S.KM", "Penyuluh Kesehatan", "Promkes"),
            ("Fajar Nugroho, A.Md.AK", "Analis Laboratorium", "Laboratorium"),
            ("Rina Marlina, A.Md.Keb", "Bidan", "KIA"),
            ("Hendra Gunawan, A.Md.KL", "Sanitarian", "Kesling"),
            ("Sri Wahyuni, A.Md.Kep", "Perawat", "PTM"),
            ("Taufik Rahman, drg", "Dokter Gigi", "UKP"),
        ]
        for i, (nama, jab, unit) in enumerate(nakes, 1):
            users.append({"username": f"pegawai{i}", "nip": f"1990{i:02d}15 2015{i:02d} 1 00{i}",
                          "email": f"pegawai{i}@espak.id", "password": "pegawai123", "nama": nama,
                          "role": "pegawai", "jabatan": jab, "unit": unit})
        for u in users:
            await db.users.insert_one({
                "id": str(uuid.uuid4()), "username": u["username"], "nip": u["nip"], "email": u["email"],
                "password_hash": hash_password(u["password"]), "nama": u["nama"], "role": u["role"],
                "jabatan": u["jabatan"], "unit": u["unit"], "status": "aktif",
                "created_at": now_iso(), "updated_at": now_iso(),
            })

    all_users = await db.users.find().to_list(1000)
    staff = [u for u in all_users if u["role"] in ("pegawai", "pj_program")]
    pj_kia = next((u for u in all_users if u["username"] == "pjkia"), None)
    pj_tb = next((u for u in all_users if u["username"] == "pjtb"), None)

    # ---- Certificates ----
    if await db.certificates.count_documents({}) == 0:
        pelatihan_pool = [
            ("Pelatihan BTCLS", "Teknis", "Kemenkes RI", 30),
            ("Workshop Manajemen KIA", "Teknis", "Dinkes Kota", 16),
            ("Pelatihan Gizi Balita", "Teknis", "Dinkes Provinsi", 8),
            ("Seminar Nasional TB", "Seminar", "PDPI", 6),
            ("Pelatihan Komunikasi Efektif", "Soft Skill", "BPSDM", 8),
            ("Workshop Rekam Medis Elektronik", "Teknis", "Kemenkes RI", 12),
            ("Pelatihan Imunisasi Dasar", "Teknis", "Dinkes Kota", 10),
            ("Pelatihan PPGD", "Teknis", "PPNI", 20),
            ("Bimtek SPM Kesehatan", "Teknis", "Kemendagri", 8),
            ("Pelatihan Surveilans Epidemiologi", "Teknis", "Kemenkes RI", 14),
        ]
        base = datetime.now(timezone.utc)
        for idx, s in enumerate(staff):
            # varying number of certs 0..7
            n = [7, 6, 5, 4, 3, 2, 1, 0, 3, 5, 2, 4][idx % 12]
            for j in range(n):
                pel = pelatihan_pool[(idx + j) % len(pelatihan_pool)]
                tgl = (base - timedelta(days=30 * (j + 1) + idx)).strftime("%Y-%m-%d")
                # most approved, some pending
                status = "disetujui" if j < n - 1 or idx % 3 != 0 else "menunggu"
                await db.certificates.insert_one({
                    "id": str(uuid.uuid4()), "employee_id": s["id"], "nama_pelatihan": pel[0],
                    "jenis_pelatihan": pel[1], "penyelenggara": pel[2], "nomor_sertifikat": f"SRT/{idx}{j}/2025",
                    "tanggal_pelatihan": tgl, "jpl": pel[3], "keterangan": "",
                    "storage_path": "", "original_filename": "sertifikat_demo.pdf", "content_type": "application/pdf",
                    "file_size": 102400, "status": status, "catatan_verifikasi": "",
                    "verified_by": "Administrator E-SPAK" if status == "disetujui" else "",
                    "verified_at": now_iso() if status == "disetujui" else "", "created_at": now_iso(),
                })

    # ---- Programs & Indicators & Reports ----
    if await db.programs.count_documents({}) == 0:
        programs_def = [
            ("KIA & Gizi", pj_kia, [
                ("Pelayanan Kesehatan Ibu Hamil", 100, "%", 92),
                ("Pelayanan Kesehatan Ibu Bersalin", 100, "%", 88),
                ("Pelayanan Kesehatan Balita", 100, "%", 75),
            ]),
            ("P2P & TB", pj_tb, [
                ("Pelayanan Kesehatan Orang Terduga TBC", 100, "%", 68),
                ("Pelayanan Kesehatan Orang Risiko HIV", 100, "%", 82),
            ]),
            ("PTM", None, [
                ("Pelayanan Kesehatan Penderita Hipertensi", 100, "%", 71),
                ("Pelayanan Kesehatan Penderita Diabetes Melitus", 100, "%", 79),
            ]),
            ("Imunisasi", None, [
                ("Cakupan Imunisasi Dasar Lengkap", 95, "%", 96),
            ]),
            ("Kesehatan Jiwa & Lansia", None, [
                ("Pelayanan Kesehatan ODGJ Berat", 100, "%", 100),
                ("Pelayanan Kesehatan Usia Lanjut", 100, "%", 85),
            ]),
        ]
        now = datetime.now(timezone.utc)
        for pnama, pj, inds in programs_def:
            pid = str(uuid.uuid4())
            await db.programs.insert_one({
                "id": pid, "nama_program": pnama,
                "penanggung_jawab_id": pj["id"] if pj else "",
                "penanggung_jawab": pj["nama"] if pj else "-", "status": "aktif", "created_at": now_iso(),
            })
            for inama, target, satuan, capaian_now in inds:
                iid = str(uuid.uuid4())
                await db.indicators.insert_one({
                    "id": iid, "program_id": pid, "nama_indikator": inama, "target": target,
                    "satuan": satuan, "status": "aktif", "created_at": now_iso(),
                })
                # create reports for last 5 months with slight trend toward capaian_now
                for m in range(4, -1, -1):
                    dt = now - timedelta(days=30 * m)
                    cap = max(40, capaian_now - m * 4)
                    denom = 100
                    num = round(cap * denom / 100)
                    ratio = (cap / target) * 100
                    status = "hijau" if ratio >= 100 else ("kuning" if ratio >= 80 else "merah")
                    await db.indicator_reports.insert_one({
                        "id": str(uuid.uuid4()), "indicator_id": iid, "bulan": dt.month, "tahun": dt.year,
                        "numerator": num, "denominator": denom, "capaian": cap, "target": target,
                        "status": status,
                        "masalah": "Cakupan sasaran belum optimal" if status != "hijau" else "",
                        "analisis": "Keterbatasan tenaga & jangkauan wilayah" if status != "hijau" else "",
                        "tindak_lanjut": "Peningkatan kunjungan lapangan" if status != "hijau" else "",
                        "penanggung_jawab": pj["nama"] if pj else "PJ Program",
                        "created_at": now_iso(),
                    })

    # ---- Policy brief sample ----
    if await db.policy_briefs.count_documents({}) == 0:
        now = datetime.now(timezone.utc)
        await db.policy_briefs.insert_one({
            "id": str(uuid.uuid4()), "periode": now.strftime("%m-%Y"),
            "masalah": "Capaian indikator TBC dan Balita berada di bawah target.",
            "analisis": "Penjaringan suspek TB belum optimal dan kunjungan balita menurun.",
            "dampak": "Berpotensi menurunkan capaian SPM tahunan.",
            "rekomendasi": "Intensifkan penemuan kasus aktif dan sweeping balita.",
            "penanggung_jawab": "P2P & TB, KIA & Gizi",
            "target_penyelesaian": (now + timedelta(days=30)).strftime("%d-%m-%Y"),
            "status": "Dalam Proses", "dibuat_oleh": "dr. H. Ahmad Fauzi, M.Kes", "created_at": now_iso(),
        })
