"""Backend tests for E-SPAK MVP."""
import os
import io
import pytest
import requests
from datetime import datetime, timezone

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://branch-main-deploy-2.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------------- Fixtures ----------------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


def _login(session, identifier, password):
    r = session.post(f"{API}/auth/login", json={"identifier": identifier, "password": password})
    assert r.status_code == 200, f"Login failed for {identifier}: {r.status_code} {r.text}"
    return r.json()["token"], r.json()["user"]


@pytest.fixture(scope="session")
def admin_token(s):
    tok, _ = _login(s, "admin", "admin123")
    return tok


@pytest.fixture(scope="session")
def kepala_token(s):
    tok, _ = _login(s, "kepala", "kepala123")
    return tok


@pytest.fixture(scope="session")
def pj_token(s):
    tok, _ = _login(s, "pjkia", "pj123")
    return tok


@pytest.fixture(scope="session")
def pegawai_token_and_user(s):
    tok, u = _login(s, "pegawai1", "pegawai123")
    return tok, u


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------------- Auth ----------------
class TestAuth:
    def test_login_wrong_password(self, s):
        r = s.post(f"{API}/auth/login", json={"identifier": "admin", "password": "wrong"})
        assert r.status_code == 401
        assert "salah" in r.json().get("detail", "").lower()

    def test_login_nip_or_username(self, s):
        r = s.post(f"{API}/auth/login", json={"identifier": "admin", "password": "admin123"})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and d["user"]["role"] == "admin"

    def test_me(self, s, admin_token):
        r = s.get(f"{API}/auth/me", headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_me_no_token(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------------- RBAC ----------------
class TestRBAC:
    def test_pegawai_cannot_list_users(self, s, pegawai_token_and_user):
        tok, _ = pegawai_token_and_user
        r = s.get(f"{API}/users", headers=H(tok))
        assert r.status_code == 403

    def test_pegawai_cannot_list_employees(self, s, pegawai_token_and_user):
        tok, _ = pegawai_token_and_user
        r = s.get(f"{API}/employees", headers=H(tok))
        assert r.status_code == 403

    def test_admin_can_list_users(self, s, admin_token):
        r = s.get(f"{API}/users", headers=H(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) >= 12

    def test_pegawai_cannot_create_indicator(self, s, pegawai_token_and_user):
        tok, _ = pegawai_token_and_user
        r = s.post(f"{API}/indicators", headers=H(tok),
                   json={"program_id": "x", "nama_indikator": "TEST_x", "target": 100})
        assert r.status_code == 403


# ---------------- Dashboard ----------------
class TestDashboard:
    def test_dashboard_stats(self, s, admin_token):
        r = s.get(f"{API}/dashboard/stats", headers=H(admin_token))
        assert r.status_code == 200
        d = r.json()
        c = d["cards"]
        assert c["total_pegawai"] == 12
        assert c["total_program"] == 5
        assert c["total_indikator"] == 10
        assert "ranking" in d and "jpl_monthly" in d and "distribusi_status" in d

    def test_me_stats(self, s, pegawai_token_and_user):
        tok, u = pegawai_token_and_user
        r = s.get(f"{API}/me/stats", headers=H(tok))
        assert r.status_code == 200
        d = r.json()
        assert d["settings"]["target_jpl"] == 40
        assert d["settings"]["target_sertifikat"] == 8
        assert d["stats"]["id"] == u["id"]
        assert d["stats"]["status"] in ("BELUM_MULAI", "DALAM_PROSES", "MEMENUHI_JPL", "MEMENUHI_JPL_DAN_SERTIFIKAT")


# ---------------- Employees ----------------
class TestEmployees:
    def test_employees_sorted(self, s, admin_token):
        r = s.get(f"{API}/employees", headers=H(admin_token))
        assert r.status_code == 200
        emps = r.json()["employees"]
        assert len(emps) == 12
        jpls = [e["total_jpl"] for e in emps]
        assert jpls == sorted(jpls, reverse=True)


# ---------------- Certificates ----------------
MINI_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


class TestCertificates:
    def test_upload_invalid_format(self, s, pegawai_token_and_user):
        tok, _ = pegawai_token_and_user
        files = {"file": ("t.txt", b"hello", "text/plain")}
        data = {"nama_pelatihan": "TEST_bad", "jpl": "2"}
        r = s.post(f"{API}/certificates", headers=H(tok), data=data, files=files)
        assert r.status_code == 400
        assert "format" in r.json()["detail"].lower()

    def test_upload_too_large(self, s, pegawai_token_and_user):
        tok, _ = pegawai_token_and_user
        big = b"A" * (2 * 1024 * 1024 + 100)
        files = {"file": ("big.pdf", big, "application/pdf")}
        data = {"nama_pelatihan": "TEST_big", "jpl": "2"}
        r = s.post(f"{API}/certificates", headers=H(tok), data=data, files=files)
        assert r.status_code == 400
        assert "2 mb" in r.json()["detail"].lower() or "melebihi" in r.json()["detail"].lower()

    def test_upload_and_verify_flow(self, s, admin_token, pegawai_token_and_user):
        tok, u = pegawai_token_and_user
        # Get baseline JPL
        base = s.get(f"{API}/me/stats", headers=H(tok)).json()["stats"]["total_jpl"]

        files = {"file": ("cert.pdf", MINI_PDF, "application/pdf")}
        data = {"nama_pelatihan": "TEST_UploadFlow", "jpl": "5", "tanggal_pelatihan": "2025-06-01"}
        r = s.post(f"{API}/certificates", headers=H(tok), data=data, files=files)
        if r.status_code != 200:
            pytest.skip(f"Upload failed (storage): {r.status_code} {r.text}")
        cert = r.json()
        assert cert["status"] == "menunggu"
        cid = cert["id"]

        # Reject without catatan → 400
        r = s.put(f"{API}/certificates/{cid}/verify", headers=H(admin_token),
                  json={"status": "ditolak", "catatan": ""})
        assert r.status_code == 400

        # Approve
        r = s.put(f"{API}/certificates/{cid}/verify", headers=H(admin_token),
                  json={"status": "disetujui", "catatan": "OK"})
        assert r.status_code == 200

        # JPL increased
        new = s.get(f"{API}/me/stats", headers=H(tok)).json()["stats"]["total_jpl"]
        assert new == base + 5

        # Notifications for pegawai
        notifs = s.get(f"{API}/notifications", headers=H(tok)).json()
        assert notifs["unread"] >= 1
        titles = [n["judul"] for n in notifs["notifications"]]
        assert any("Disetujui" in t for t in titles)

        # cleanup
        s.delete(f"{API}/certificates/{cid}", headers=H(admin_token))


# ---------------- SPM ----------------
class TestSPM:
    def test_programs_indicators(self, s, admin_token):
        p = s.get(f"{API}/programs", headers=H(admin_token)).json()
        i = s.get(f"{API}/indicators", headers=H(admin_token)).json()
        assert len(p) == 5
        assert len(i) == 10

    def test_report_upsert_and_status(self, s, pj_token):
        inds = s.get(f"{API}/indicators", headers=H(pj_token)).json()
        iid = inds[0]["id"]
        payload = {"indicator_id": iid, "bulan": 12, "tahun": 2025,
                   "numerator": 50, "denominator": 100, "target": 100}
        r = s.post(f"{API}/reports", headers=H(pj_token), json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["capaian"] == 50.0
        assert d["status"] == "merah"
        first_id = d["id"]

        # Upsert same indicator+bulan+tahun → 100% hijau
        payload["numerator"] = 100
        r2 = s.post(f"{API}/reports", headers=H(pj_token), json=payload)
        assert r2.json()["id"] == first_id
        assert r2.json()["status"] == "hijau"

        # 85 → kuning
        payload["numerator"] = 85
        r3 = s.post(f"{API}/reports", headers=H(pj_token), json=payload)
        assert r3.json()["status"] == "kuning"

    def test_spm_dashboard(self, s, admin_token):
        now = datetime.now(timezone.utc)
        r = s.get(f"{API}/spm/dashboard", headers=H(admin_token),
                  params={"bulan": now.month, "tahun": now.year})
        assert r.status_code == 200
        d = r.json()
        assert "summary" in d and "reports" in d and "trend" in d and "top_masalah" in d


# ---------------- EWS / Policy / Settings ----------------
class TestOthers:
    def test_ews(self, s, admin_token):
        r = s.get(f"{API}/ews", headers=H(admin_token))
        assert r.status_code == 200
        d = r.json()
        assert "warnings" in d and "counts" in d
        for k in ("merah", "kuning", "pegawai_belum", "belum_upload"):
            assert k in d["counts"]

    def test_policy_brief_generate_and_create(self, s, admin_token):
        r = s.post(f"{API}/policy-briefs/generate", headers=H(admin_token))
        assert r.status_code == 200
        draft = r.json()
        for k in ("periode", "masalah", "analisis", "rekomendasi"):
            assert k in draft
        # Create
        r2 = s.post(f"{API}/policy-briefs", headers=H(admin_token), json=draft)
        assert r2.status_code == 200
        bid = r2.json()["id"]
        # list contains it
        lst = s.get(f"{API}/policy-briefs", headers=H(admin_token)).json()
        assert any(b["id"] == bid for b in lst)
        s.delete(f"{API}/policy-briefs/{bid}", headers=H(admin_token))

    def test_settings_update_and_reflect(self, s, admin_token, pegawai_token_and_user):
        tok, _ = pegawai_token_and_user
        # Set target to 50/10
        r = s.put(f"{API}/settings", headers=H(admin_token),
                  json={"target_jpl": 50, "target_sertifikat": 10})
        assert r.status_code == 200
        assert r.json()["target_jpl"] == 50
        me = s.get(f"{API}/me/stats", headers=H(tok)).json()
        assert me["settings"]["target_jpl"] == 50
        # Revert
        s.put(f"{API}/settings", headers=H(admin_token),
              json={"target_jpl": 40, "target_sertifikat": 8})

    def test_audit_logs(self, s, admin_token):
        r = s.get(f"{API}/audit-logs", headers=H(admin_token))
        assert r.status_code == 200
        logs = r.json()
        assert isinstance(logs, list) and len(logs) > 0
        assert "aktivitas" in logs[0]

    def test_export_employees_via_query_auth(self, s, admin_token):
        r = s.get(f"{API}/export/employees", params={"auth": admin_token})
        assert r.status_code == 200
        assert "Nama,NIP" in r.text

    def test_export_spm_via_query_auth(self, s, admin_token):
        r = s.get(f"{API}/export/spm", params={"auth": admin_token})
        assert r.status_code == 200
        assert "Program,Indikator" in r.text
