#!/usr/bin/env bash
# ==============================================================================
# PATHWAY.ECO - Standalone Document Tools Engine Automated Test Suite
# Tests all 13 required verification items against the running container or server
# ==============================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
API_KEY="${TOOLS_API_KEY:-test-admin-secret-key-12345}"
CRON_SECRET="${CRON_SECRET:-test-cron-secret-key-67890}"
RESUME_FIXTURES="backend/src/tests/fixtures/resume-parser/resumes"
TMP_DIR=$(mktemp -d /tmp/tools-test.XXXXXX)

trap 'rm -rf "$TMP_DIR"' EXIT

echo "================================================================="
echo " PATHWAY.ECO TOOLS ENGINE - 13-POINT VERIFICATION SUITE"
echo " Target URL : $BASE_URL"
echo " Timestamp  : $(date)"
echo "================================================================="

PASSED=0
FAILED=0

run_test() {
  local name="$1"
  shift
  echo -n "[TEST] $name ... "
  if "$@"; then
    echo " PASSED"
    PASSED=$((PASSED + 1))
  else
    echo " FAILED"
    FAILED=$((FAILED + 1))
  fi
}

# ------------------------------------------------------------------------------
# 1. API Health Check
# ------------------------------------------------------------------------------
test_health() {
  local resp
  resp=$(curl -s -f "$BASE_URL/api/tools/health" || return 1)
  echo "$resp" | grep -q '"success":true' || return 1
  echo "$resp" | grep -q '"available":true' || return 1
  echo "$resp" | grep -q '"provider":"gotenberg"' || return 1
}
run_test "1. API health check (/api/tools/health)" test_health

# ------------------------------------------------------------------------------
# 2. PDF Merge
# ------------------------------------------------------------------------------
test_pdf_merge() {
  local pdf1="$RESUME_FIXTURES/resume-05-fullstack-2y-exp.pdf"
  local pdf2="$RESUME_FIXTURES/resume-09-python-ai-research.pdf"
  local out="$TMP_DIR/merged.pdf"

  curl -s -f -X POST "$BASE_URL/api/tools/pdf/merge" \
    -H "x-api-key: $API_KEY" \
    -F "files=@$pdf1" \
    -F "files=@$pdf2" \
    -o "$out" || return 1

  head -c 4 "$out" | grep -q "%PDF" || return 1
  [ -s "$out" ] || return 1
}
run_test "2. PDF merge (/api/tools/pdf/merge)" test_pdf_merge

# ------------------------------------------------------------------------------
# 3. PDF Split
# ------------------------------------------------------------------------------
test_pdf_split() {
  local pdf="$RESUME_FIXTURES/resume-05-fullstack-2y-exp.pdf"
  local out="$TMP_DIR/split.pdf"

  curl -s -f -X POST "$BASE_URL/api/tools/pdf/split" \
    -H "x-api-key: $API_KEY" \
    -F "file=@$pdf" \
    -F "pageRanges=1" \
    -o "$out" || return 1

  head -c 4 "$out" | grep -q "%PDF" || return 1
  [ -s "$out" ] || return 1
}
run_test "3. PDF split (/api/tools/pdf/split)" test_pdf_split

# ------------------------------------------------------------------------------
# 4. PDF Rotate
# ------------------------------------------------------------------------------
test_pdf_rotate() {
  local pdf="$RESUME_FIXTURES/resume-05-fullstack-2y-exp.pdf"
  local out="$TMP_DIR/rotated.pdf"

  curl -s -f -X POST "$BASE_URL/api/tools/pdf/rotate" \
    -H "x-api-key: $API_KEY" \
    -F "file=@$pdf" \
    -F "rotationDegrees=90" \
    -F "pages=all" \
    -o "$out" || return 1

  head -c 4 "$out" | grep -q "%PDF" || return 1
  [ -s "$out" ] || return 1
}
run_test "4. PDF rotate (/api/tools/pdf/rotate)" test_pdf_rotate

# ------------------------------------------------------------------------------
# 5. PDF Compression
# ------------------------------------------------------------------------------
test_pdf_compress() {
  local pdf="$RESUME_FIXTURES/resume-05-fullstack-2y-exp.pdf"
  local out="$TMP_DIR/compressed.pdf"

  curl -s -f -X POST "$BASE_URL/api/tools/pdf/compress" \
    -H "x-api-key: $API_KEY" \
    -F "file=@$pdf" \
    -F "level=balanced" \
    -o "$out" || return 1

  head -c 4 "$out" | grep -q "%PDF" || return 1
  [ -s "$out" ] || return 1
}
run_test "5. PDF compression (/api/tools/pdf/compress)" test_pdf_compress

# ------------------------------------------------------------------------------
# 6. DOCX to PDF Conversion
# ------------------------------------------------------------------------------
DOCX_JOB_ID=""
DOCX_GUEST_TOKEN=""
test_docx_conversion() {
  local docx="test-fixtures/sample.docx"
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/tools/conversions" \
    -H "x-forwarded-for: 10.0.0.1" \
    -F "file=@$docx" \
    -F "targetFormat=pdf")

  echo "$resp" | grep -q '"success":true' || { echo "Resp: $resp"; return 1; }
  DOCX_JOB_ID=$(echo "$resp" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
  DOCX_GUEST_TOKEN=$(echo "$resp" | grep -o '"guestToken":"[^"]*"' | cut -d'"' -f4)
  [ -n "$DOCX_JOB_ID" ] || return 1
  [ -n "$DOCX_GUEST_TOKEN" ] || return 1
}
run_test "6. DOCX to PDF conversion" test_docx_conversion

# ------------------------------------------------------------------------------
# 7. XLSX to PDF Conversion
# ------------------------------------------------------------------------------
XLSX_JOB_ID=""
XLSX_GUEST_TOKEN=""
test_xlsx_conversion() {
  local xlsx="test-fixtures/sample.xlsx"
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/tools/conversions" \
    -H "x-forwarded-for: 10.0.0.2" \
    -F "file=@$xlsx" \
    -F "targetFormat=pdf")

  echo "$resp" | grep -q '"success":true' || { echo "Resp: $resp"; return 1; }
  XLSX_JOB_ID=$(echo "$resp" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
  XLSX_GUEST_TOKEN=$(echo "$resp" | grep -o '"guestToken":"[^"]*"' | cut -d'"' -f4)
  [ -n "$XLSX_JOB_ID" ] || return 1
  [ -n "$XLSX_GUEST_TOKEN" ] || return 1
}
run_test "7. XLSX to PDF conversion" test_xlsx_conversion

# ------------------------------------------------------------------------------
# 8. Large File Handling within 25 MB Limit
# ------------------------------------------------------------------------------
test_large_file() {
  local large_xlsx="test-fixtures/large_spreadsheet.xlsx"
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/tools/conversions" \
    -H "x-forwarded-for: 10.0.0.3" \
    -F "file=@$large_xlsx" \
    -F "targetFormat=pdf")

  echo "$resp" | grep -q '"success":true' || { echo "Resp: $resp"; return 1; }
}
run_test "8. Large file handling within 25 MB limit" test_large_file

# ------------------------------------------------------------------------------
# 9. Invalid File Rejection (Empty File)
# ------------------------------------------------------------------------------
test_invalid_rejection() {
  local empty_doc="test-fixtures/empty.docx"
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/tools/conversions" \
    -H "x-forwarded-for: 10.0.0.4" \
    -F "file=@$empty_doc" \
    -F "targetFormat=pdf")

  echo "$resp" | grep -q 'EMPTY_FILE' || { echo "Resp: $resp"; return 1; }
}
run_test "9. Invalid file rejection (empty file)" test_invalid_rejection

# ------------------------------------------------------------------------------
# 10. Macro-Enabled File Rejection
# ------------------------------------------------------------------------------
test_macro_rejection() {
  local macro_doc="test-fixtures/macro-enabled.docm"
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/tools/conversions" \
    -H "x-forwarded-for: 10.0.0.5" \
    -F "file=@$macro_doc" \
    -F "targetFormat=pdf")

  echo "$resp" | grep -q 'INVALID_FILE_TYPE' || { echo "Resp: $resp"; return 1; }
}
run_test "10. Macro-enabled file rejection" test_macro_rejection

# ------------------------------------------------------------------------------
# 11. Guest Download Authorization & Protection
# ------------------------------------------------------------------------------
test_guest_download_protection() {
  local out="$TMP_DIR/auth-download.pdf"
  # 1. Authorized request with guest token -> must return HTTP 200 with PDF bytes
  curl -s -f -H "x-guest-token: $DOCX_GUEST_TOKEN" \
    "$BASE_URL/api/tools/conversions/$DOCX_JOB_ID/download" \
    -o "$out" || return 1
  head -c 4 "$out" | grep -q "%PDF" || return 1

  # 2. Unauthorized request without guest token -> must return HTTP 403
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tools/conversions/$DOCX_JOB_ID/download")
  [ "$http_code" -eq 403 ] || {
    echo "Expected 403, got $http_code"
    return 1
  }
}
run_test "11. Guest download authorization & protection" test_guest_download_protection

# ------------------------------------------------------------------------------
# 12. Temporary File Cleanup Endpoint
# ------------------------------------------------------------------------------
test_cleanup() {
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/tools/cleanup" \
    -H "Authorization: Bearer $CRON_SECRET")

  echo "$resp" | grep -q '"success":true' || { echo "Resp: $resp"; return 1; }
}
run_test "12. Temporary file cleanup (/api/tools/cleanup)" test_cleanup

# ------------------------------------------------------------------------------
# 13. Database Job Tracking
# ------------------------------------------------------------------------------
test_db_tracking() {
  local resp
  resp=$(curl -s -H "x-guest-token: $DOCX_GUEST_TOKEN" "$BASE_URL/api/tools/conversions/$DOCX_JOB_ID")
  echo "$resp" | grep -q '"status":"COMPLETED"' || return 1
  echo "$resp" | grep -q '"originalFilename":"sample.docx"' || return 1
  echo "$resp" | grep -q '"outputFilename":"sample.pdf"' || return 1
}
run_test "13. Database job tracking (/api/tools/conversions/:id)" test_db_tracking

# ------------------------------------------------------------------------------
# Summary & Container Stats
# ------------------------------------------------------------------------------
echo "================================================================="
echo " VERIFICATION SUMMARY: $PASSED / $((PASSED + FAILED)) TESTS PASSED"
echo "================================================================="

if command -v docker >/dev/null 2>&1; then
  echo ""
  echo "--- Docker Container Resource Consumption ---"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}" || true
fi

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
exit 0
