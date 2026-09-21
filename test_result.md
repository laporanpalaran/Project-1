#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Continuation of E-SPAK (Puskesmas Palaran). Recent requests:
  1. Removed default demo-account hints from login page (done).
  2. Deleted all default certificates & SPM data, kept all users (done).
  3. Seed official SPM Kesehatan indicators per Permenkes No. 6 Tahun 2024
     (5 programs, 12 indicators, target 100%, no monthly capaian).
  4. Add Backup feature (admin only): full JSON backup + restore/import,
     Excel export (multi-sheet), CSV export per data type (users & SPM capaian).

backend:
  - task: "Official SPM seeding (Permenkes 6/2024) - 5 programs, 12 indicators"
    implemented: true
    working: true
    file: "backend/seed.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "seed.py now seeds only users + official SPM structure (5 programs / 12 indicators, target 100%, no capaian/certificates/policy). Idempotent (only seeds programs when empty). Verified via direct DB query: programs=5, indicators=12."
        -working: true
        -agent: "testing"
        -comment: "✅ VERIFIED: GET /api/programs returns exactly 5 programs with correct names including 'Kesehatan Ibu, Bayi & Balita (KIA)' and 'Pencegahan & Pengendalian Penyakit Menular (P2P)'. GET /api/indicators returns exactly 12 indicators, all with target=100. GET /api/certificates returns empty list as expected."

  - task: "Backup export (full JSON) - GET /api/backup/export (admin)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns JSON dump of all collections incl. users (with password_hash for restorability). Admin only. Curl verified HTTP 200, valid structure."
        -working: true
        -agent: "testing"
        -comment: "✅ VERIFIED: GET /api/backup/export returns HTTP 200 with valid JSON structure containing keys: app, version, exported_at, collections. Verified collections.users has 14 users and ALL include password_hash field (required for restore). Verified collections.programs length == 5 and collections.indicators length == 12."

  - task: "Backup import/restore - POST /api/backup/import (admin, multipart file+mode)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Accepts JSON backup file; mode=replace (delete then insert) or merge (upsert by id). Admin only. Curl verified merge keeps counts unchanged."
        -working: true
        -agent: "testing"
        -comment: "✅ VERIFIED: POST /api/backup/import with multipart file and mode=merge returns HTTP 200 with {ok:true, mode:'merge', restored:{...}}. After merge, verified GET /api/users count == 14, GET /api/programs == 5, GET /api/indicators == 12 (no data lost/duplicated). Also tested mode=replace with same file and confirmed users still 14, programs still 5, indicators still 12 (no data loss)."

  - task: "Backup Excel export - GET /api/backup/excel (admin)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "openpyxl workbook with 4 sheets: Pengguna, Program, Indikator, Capaian SPM. Curl verified valid xlsx."
        -working: true
        -agent: "testing"
        -comment: "✅ VERIFIED: GET /api/backup/excel returns HTTP 200 with Content-Type header containing 'spreadsheetml' (valid .xlsx). Response body is non-empty binary (8535 bytes)."

  - task: "Backup CSV export - GET /api/backup/csv?dataset=users|spm (admin)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "CSV for users and SPM capaian. Invalid dataset returns 400. Curl verified HTTP 200."
        -working: true
        -agent: "testing"
        -comment: "✅ VERIFIED: GET /api/backup/csv?dataset=users returns HTTP 200 with CSV text containing header row 'No,Nama,Username,...' and 14 data rows. GET /api/backup/csv?dataset=spm returns HTTP 200 with valid CSV. GET /api/backup/csv?dataset=invalid correctly returns HTTP 400."

frontend:
  - task: "Backup tab UI in Pengaturan (admin)"
    implemented: true
    working: "NA"
    file: "frontend/src/pages/Pengaturan.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "New 'Backup' tab with download JSON/Excel/CSV buttons and restore (file upload + mode select). Downloads use ?auth=token query param; restore uses api.post multipart. Visually verified via screenshot."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Backup export (full JSON) - GET /api/backup/export (admin)"
    - "Backup import/restore - POST /api/backup/import (admin, multipart file+mode)"
    - "Backup Excel export - GET /api/backup/excel (admin)"
    - "Backup CSV export - GET /api/backup/csv?dataset=users|spm (admin)"
    - "Official SPM seeding (Permenkes 6/2024) - 5 programs, 12 indicators"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: |
      Please test the new Backup endpoints (admin-only). Admin creds: identifier=admin, password=admin123
      (login: POST /api/auth/login body {"identifier","password"}).
      1. GET /api/backup/export -> 200, JSON with keys app/version/exported_at/collections; collections.users must be non-empty and include password_hash (needed for restore).
      2. GET /api/backup/excel -> 200, valid xlsx (content-type spreadsheetml).
      3. GET /api/backup/csv?dataset=users -> 200 CSV; ?dataset=spm -> 200 CSV; ?dataset=xxx -> 400.
      4. POST /api/backup/import (multipart: file=<backup json from step1>, mode=merge) -> 200, restored summary; verify user/program/indicator counts unchanged (14 users, 5 programs, 12 indicators). Also test mode=replace does not lose users.
      5. Verify RBAC: a non-admin (e.g. pegawai1/pegawai123) gets 403 on all /api/backup/* endpoints.
      6. Confirm SPM seeding: GET /api/programs -> 5 programs; GET /api/indicators -> 12 indicators (target 100). certificates empty.
      Do NOT test frontend yet.
    -agent: "testing"
    -message: |
      ✅ ALL BACKEND TESTS PASSED (18/18)
      
      Completed comprehensive testing of all Backup endpoints and SPM seeding:
      
      1. ✅ Admin authentication working
      2. ✅ Backup export (JSON) - verified structure, password_hash in all users, 5 programs, 12 indicators
      3. ✅ Backup Excel export - valid xlsx format (8535 bytes)
      4. ✅ Backup CSV export - users and spm datasets working, invalid dataset returns 400
      5. ✅ Backup import - both merge and replace modes working, data counts preserved (14 users, 5 programs, 12 indicators)
      6. ✅ RBAC - non-admin (pegawai1) correctly receives 403 on all backup endpoints
      7. ✅ SPM seeding - 5 programs with correct names, 12 indicators all with target=100, certificates empty
      
      All backend functionality is working correctly. No issues found.