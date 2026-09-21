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

    # NOTE: Default seeding of certificates, SPM (programs/indicators/reports),
    # and policy briefs is intentionally disabled so the website starts clean.
    return
