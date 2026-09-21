#!/usr/bin/env python3
"""
Backend API tests for E-SPAK Backup & SPM seeding features.
Tests all backup endpoints and verifies SPM data structure.
"""
import requests
import json
import sys
import io
from typing import Dict, Any

# Backend URL from environment
BASE_URL = "https://branch-main-deploy-2.preview.emergentagent.com/api"

# Test credentials
ADMIN_CREDS = {"identifier": "admin", "password": "admin123"}
PEGAWAI_CREDS = {"identifier": "pegawai1", "password": "pegawai123"}

class TestResult:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name: str, details: str = ""):
        self.passed.append(f"✅ {test_name}" + (f": {details}" if details else ""))
    
    def add_fail(self, test_name: str, error: str):
        self.failed.append(f"❌ {test_name}: {error}")
    
    def add_warning(self, test_name: str, warning: str):
        self.warnings.append(f"⚠️  {test_name}: {warning}")
    
    def print_summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        if self.failed:
            print("\n🔴 FAILED TESTS:")
            for fail in self.failed:
                print(f"  {fail}")
        
        if self.warnings:
            print("\n🟡 WARNINGS:")
            for warn in self.warnings:
                print(f"  {warn}")
        
        if self.passed:
            print("\n🟢 PASSED TESTS:")
            for pass_test in self.passed:
                print(f"  {pass_test}")
        
        print("\n" + "="*80)
        print(f"Total: {len(self.passed)} passed, {len(self.failed)} failed, {len(self.warnings)} warnings")
        print("="*80)
        
        return len(self.failed) == 0

result = TestResult()

def login(credentials: Dict[str, str]) -> str:
    """Login and return JWT token"""
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=credentials, timeout=10)
        if resp.status_code != 200:
            raise Exception(f"Login failed: HTTP {resp.status_code}, {resp.text}")
        data = resp.json()
        if "token" not in data:
            raise Exception(f"No token in response: {data}")
        return data["token"]
    except Exception as e:
        raise Exception(f"Login error: {str(e)}")

def test_admin_login():
    """Test 0: Admin login"""
    try:
        token = login(ADMIN_CREDS)
        result.add_pass("Admin login", f"Token received (length: {len(token)})")
        return token
    except Exception as e:
        result.add_fail("Admin login", str(e))
        return None

def test_backup_export(token: str):
    """Test 1: GET /api/backup/export"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/backup/export", headers=headers, timeout=30)
        
        if resp.status_code != 200:
            result.add_fail("Backup export", f"HTTP {resp.status_code}: {resp.text[:200]}")
            return None
        
        # Verify JSON structure
        data = resp.json()
        
        # Check required keys
        required_keys = ["app", "version", "exported_at", "collections"]
        missing_keys = [k for k in required_keys if k not in data]
        if missing_keys:
            result.add_fail("Backup export structure", f"Missing keys: {missing_keys}")
            return None
        
        collections = data.get("collections", {})
        
        # Check users collection
        users = collections.get("users", [])
        if not users:
            result.add_fail("Backup export users", "users collection is empty")
            return None
        
        # Verify password_hash in users
        users_without_hash = [u.get("username", "?") for u in users if "password_hash" not in u]
        if users_without_hash:
            result.add_fail("Backup export password_hash", 
                          f"Users missing password_hash: {users_without_hash[:5]}")
            return None
        
        # Check programs count
        programs = collections.get("programs", [])
        if len(programs) != 5:
            result.add_fail("Backup export programs", 
                          f"Expected 5 programs, got {len(programs)}")
            return None
        
        # Check indicators count
        indicators = collections.get("indicators", [])
        if len(indicators) != 12:
            result.add_fail("Backup export indicators", 
                          f"Expected 12 indicators, got {len(indicators)}")
            return None
        
        result.add_pass("Backup export", 
                       f"Valid JSON with {len(users)} users (all with password_hash), "
                       f"5 programs, 12 indicators")
        return data
        
    except Exception as e:
        result.add_fail("Backup export", f"Exception: {str(e)}")
        return None

def test_backup_excel(token: str):
    """Test 2: GET /api/backup/excel"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/backup/excel", headers=headers, timeout=30)
        
        if resp.status_code != 200:
            result.add_fail("Backup Excel", f"HTTP {resp.status_code}: {resp.text[:200]}")
            return
        
        # Check Content-Type
        content_type = resp.headers.get("Content-Type", "")
        if "spreadsheetml" not in content_type:
            result.add_fail("Backup Excel Content-Type", 
                          f"Expected 'spreadsheetml', got '{content_type}'")
            return
        
        # Check body is non-empty
        if len(resp.content) == 0:
            result.add_fail("Backup Excel body", "Response body is empty")
            return
        
        result.add_pass("Backup Excel", 
                       f"Valid xlsx (Content-Type: {content_type}, size: {len(resp.content)} bytes)")
        
    except Exception as e:
        result.add_fail("Backup Excel", f"Exception: {str(e)}")

def test_backup_csv(token: str):
    """Test 3: GET /api/backup/csv"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test users dataset
    try:
        resp = requests.get(f"{BASE_URL}/backup/csv?dataset=users", headers=headers, timeout=30)
        
        if resp.status_code != 200:
            result.add_fail("Backup CSV (users)", f"HTTP {resp.status_code}: {resp.text[:200]}")
        else:
            text = resp.text
            if not text.startswith("No,Nama,Username"):
                result.add_fail("Backup CSV (users) header", 
                              f"Expected header 'No,Nama,Username,...', got: {text[:50]}")
            else:
                lines = text.strip().split('\n')
                result.add_pass("Backup CSV (users)", 
                              f"Valid CSV with header, {len(lines)-1} data rows")
    except Exception as e:
        result.add_fail("Backup CSV (users)", f"Exception: {str(e)}")
    
    # Test spm dataset
    try:
        resp = requests.get(f"{BASE_URL}/backup/csv?dataset=spm", headers=headers, timeout=30)
        
        if resp.status_code != 200:
            result.add_fail("Backup CSV (spm)", f"HTTP {resp.status_code}: {resp.text[:200]}")
        else:
            result.add_pass("Backup CSV (spm)", "Valid CSV response")
    except Exception as e:
        result.add_fail("Backup CSV (spm)", f"Exception: {str(e)}")
    
    # Test invalid dataset
    try:
        resp = requests.get(f"{BASE_URL}/backup/csv?dataset=invalid", headers=headers, timeout=30)
        
        if resp.status_code != 400:
            result.add_fail("Backup CSV (invalid)", 
                          f"Expected HTTP 400, got {resp.status_code}")
        else:
            result.add_pass("Backup CSV (invalid)", "Correctly returns HTTP 400")
    except Exception as e:
        result.add_fail("Backup CSV (invalid)", f"Exception: {str(e)}")

def test_backup_import(token: str, backup_data: Dict[str, Any]):
    """Test 4: POST /api/backup/import"""
    if not backup_data:
        result.add_fail("Backup import", "No backup data available (export test failed)")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Save backup data to file-like object
    backup_json = json.dumps(backup_data, ensure_ascii=False, indent=2)
    
    # Test merge mode
    try:
        files = {"file": ("backup.json", backup_json, "application/json")}
        data = {"mode": "merge"}
        resp = requests.post(f"{BASE_URL}/backup/import", headers=headers, 
                           files=files, data=data, timeout=60)
        
        if resp.status_code != 200:
            result.add_fail("Backup import (merge)", 
                          f"HTTP {resp.status_code}: {resp.text[:200]}")
        else:
            resp_data = resp.json()
            if not resp_data.get("ok"):
                result.add_fail("Backup import (merge)", f"Response ok=false: {resp_data}")
            elif resp_data.get("mode") != "merge":
                result.add_fail("Backup import (merge)", 
                              f"Expected mode='merge', got '{resp_data.get('mode')}'")
            else:
                restored = resp_data.get("restored", {})
                result.add_pass("Backup import (merge)", 
                              f"Success, restored: {restored}")
                
                # Verify counts after merge
                verify_counts_after_import(token, "merge")
    except Exception as e:
        result.add_fail("Backup import (merge)", f"Exception: {str(e)}")
    
    # Test replace mode
    try:
        files = {"file": ("backup.json", backup_json, "application/json")}
        data = {"mode": "replace"}
        resp = requests.post(f"{BASE_URL}/backup/import", headers=headers, 
                           files=files, data=data, timeout=60)
        
        if resp.status_code != 200:
            result.add_fail("Backup import (replace)", 
                          f"HTTP {resp.status_code}: {resp.text[:200]}")
        else:
            resp_data = resp.json()
            if not resp_data.get("ok"):
                result.add_fail("Backup import (replace)", f"Response ok=false: {resp_data}")
            elif resp_data.get("mode") != "replace":
                result.add_fail("Backup import (replace)", 
                              f"Expected mode='replace', got '{resp_data.get('mode')}'")
            else:
                restored = resp_data.get("restored", {})
                result.add_pass("Backup import (replace)", 
                              f"Success, restored: {restored}")
                
                # Verify counts after replace
                verify_counts_after_import(token, "replace")
    except Exception as e:
        result.add_fail("Backup import (replace)", f"Exception: {str(e)}")

def verify_counts_after_import(token: str, mode: str):
    """Verify data counts after import"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Check users count
        resp = requests.get(f"{BASE_URL}/users", headers=headers, timeout=10)
        if resp.status_code == 200:
            users = resp.json()
            if len(users) != 14:
                result.add_fail(f"Post-import count (users, {mode})", 
                              f"Expected 14 users, got {len(users)}")
            else:
                result.add_pass(f"Post-import count (users, {mode})", "14 users preserved")
        
        # Check programs count
        resp = requests.get(f"{BASE_URL}/programs", headers=headers, timeout=10)
        if resp.status_code == 200:
            programs = resp.json()
            if len(programs) != 5:
                result.add_fail(f"Post-import count (programs, {mode})", 
                              f"Expected 5 programs, got {len(programs)}")
            else:
                result.add_pass(f"Post-import count (programs, {mode})", "5 programs preserved")
        
        # Check indicators count
        resp = requests.get(f"{BASE_URL}/indicators", headers=headers, timeout=10)
        if resp.status_code == 200:
            indicators = resp.json()
            if len(indicators) != 12:
                result.add_fail(f"Post-import count (indicators, {mode})", 
                              f"Expected 12 indicators, got {len(indicators)}")
            else:
                result.add_pass(f"Post-import count (indicators, {mode})", "12 indicators preserved")
    except Exception as e:
        result.add_warning(f"Post-import verification ({mode})", str(e))

def test_rbac_non_admin():
    """Test 5: RBAC - non-admin should get 403"""
    try:
        token = login(PEGAWAI_CREDS)
        headers = {"Authorization": f"Bearer {token}"}
        
        endpoints = [
            "/backup/export",
            "/backup/excel",
            "/backup/csv?dataset=users",
        ]
        
        all_403 = True
        for endpoint in endpoints:
            resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)
            if resp.status_code != 403:
                result.add_fail(f"RBAC {endpoint}", 
                              f"Expected HTTP 403, got {resp.status_code}")
                all_403 = False
        
        # Test import endpoint
        files = {"file": ("test.json", '{"collections":{}}', "application/json")}
        data = {"mode": "merge"}
        resp = requests.post(f"{BASE_URL}/backup/import", headers=headers, 
                           files=files, data=data, timeout=10)
        if resp.status_code != 403:
            result.add_fail("RBAC /backup/import", 
                          f"Expected HTTP 403, got {resp.status_code}")
            all_403 = False
        
        if all_403:
            result.add_pass("RBAC (non-admin)", "All backup endpoints return 403 for pegawai1")
        
    except Exception as e:
        result.add_fail("RBAC (non-admin)", f"Exception: {str(e)}")

def test_spm_seeding(token: str):
    """Test 6: SPM seeding verification"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check programs
    try:
        resp = requests.get(f"{BASE_URL}/programs", headers=headers, timeout=10)
        if resp.status_code != 200:
            result.add_fail("SPM programs", f"HTTP {resp.status_code}: {resp.text[:200]}")
        else:
            programs = resp.json()
            if len(programs) != 5:
                result.add_fail("SPM programs count", f"Expected 5, got {len(programs)}")
            else:
                # Check for specific program names
                program_names = [p.get("nama_program", "") for p in programs]
                expected_names = [
                    "Kesehatan Ibu, Bayi & Balita (KIA)",
                    "Pencegahan & Pengendalian Penyakit Menular (P2P)"
                ]
                missing = [n for n in expected_names if n not in program_names]
                if missing:
                    result.add_fail("SPM program names", f"Missing: {missing}")
                else:
                    result.add_pass("SPM programs", 
                                  f"5 programs with correct names: {', '.join(program_names)}")
    except Exception as e:
        result.add_fail("SPM programs", f"Exception: {str(e)}")
    
    # Check indicators
    try:
        resp = requests.get(f"{BASE_URL}/indicators", headers=headers, timeout=10)
        if resp.status_code != 200:
            result.add_fail("SPM indicators", f"HTTP {resp.status_code}: {resp.text[:200]}")
        else:
            indicators = resp.json()
            if len(indicators) != 12:
                result.add_fail("SPM indicators count", f"Expected 12, got {len(indicators)}")
            else:
                # Check all targets are 100
                non_100_targets = [i.get("nama_indikator", "?")[:30] 
                                  for i in indicators if i.get("target") != 100]
                if non_100_targets:
                    result.add_fail("SPM indicator targets", 
                                  f"Non-100 targets: {non_100_targets}")
                else:
                    result.add_pass("SPM indicators", "12 indicators, all with target=100")
    except Exception as e:
        result.add_fail("SPM indicators", f"Exception: {str(e)}")
    
    # Check certificates (should be empty)
    try:
        resp = requests.get(f"{BASE_URL}/certificates", headers=headers, timeout=10)
        if resp.status_code != 200:
            result.add_fail("SPM certificates", f"HTTP {resp.status_code}: {resp.text[:200]}")
        else:
            certificates = resp.json()
            if len(certificates) != 0:
                result.add_fail("SPM certificates", 
                              f"Expected empty list, got {len(certificates)} certificates")
            else:
                result.add_pass("SPM certificates", "Empty list as expected")
    except Exception as e:
        result.add_fail("SPM certificates", f"Exception: {str(e)}")

def main():
    print("="*80)
    print("E-SPAK Backend API Tests - Backup & SPM Seeding")
    print("="*80)
    print(f"Backend URL: {BASE_URL}")
    print()
    
    # Test 0: Admin login
    print("Test 0: Admin login...")
    admin_token = test_admin_login()
    if not admin_token:
        print("❌ Cannot proceed without admin token")
        result.print_summary()
        sys.exit(1)
    
    # Test 1: Backup export
    print("\nTest 1: Backup export (JSON)...")
    backup_data = test_backup_export(admin_token)
    
    # Test 2: Backup Excel
    print("\nTest 2: Backup Excel export...")
    test_backup_excel(admin_token)
    
    # Test 3: Backup CSV
    print("\nTest 3: Backup CSV export...")
    test_backup_csv(admin_token)
    
    # Test 4: Backup import
    print("\nTest 4: Backup import (merge & replace)...")
    test_backup_import(admin_token, backup_data)
    
    # Test 5: RBAC
    print("\nTest 5: RBAC (non-admin access)...")
    test_rbac_non_admin()
    
    # Test 6: SPM seeding
    print("\nTest 6: SPM seeding verification...")
    test_spm_seeding(admin_token)
    
    # Print summary
    success = result.print_summary()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
