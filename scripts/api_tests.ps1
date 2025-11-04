# scripts/api_tests.ps1
# Quick API smoke tests for local development (PowerShell)

$base = 'http://localhost:3000'

Write-Host "Testing GET /api/employees"
Invoke-RestMethod -Uri "$base/api/employees" -Method Get | ConvertTo-Json -Depth 3 | Write-Host

Write-Host "\nTesting POST /api/employees (create sample)"
$emp = @{ name = 'PS Test User'; position = 'Tester'; department = 'QA'; accumulatedDays = 2.5; usedDays = 0; pendingDays = 2.5; monthlyRate = 2.5 } | ConvertTo-Json
$created = Invoke-RestMethod -Uri "$base/api/employees" -Method Post -Body $emp -ContentType 'application/json'
$created | ConvertTo-Json -Depth 3 | Write-Host

Write-Host "\nTesting GET /api/vacation_requests"
Invoke-RestMethod -Uri "$base/api/vacation_requests" -Method Get | ConvertTo-Json -Depth 3 | Write-Host

if ($created -and $created.id) {
  Write-Host "\nTesting POST /api/vacation_requests (for created employee)"
  $vr = @{ employee_id = $created.id; start_date = '2025-12-01'; end_date = '2025-12-05'; days = 5; reason = 'Test PS' } | ConvertTo-Json
  $vrCreated = Invoke-RestMethod -Uri "$base/api/vacation_requests" -Method Post -Body $vr -ContentType 'application/json'
  $vrCreated | ConvertTo-Json -Depth 3 | Write-Host

  Write-Host "\nTesting PATCH /api/vacation_requests (update status)"
  $patch = @{ id = $vrCreated.id; status = 'approved' } | ConvertTo-Json
  Invoke-RestMethod -Uri "$base/api/vacation_requests" -Method Patch -Body $patch -ContentType 'application/json' | ConvertTo-Json -Depth 3 | Write-Host
}

Write-Host "\nTesting POST /api/attendance (create sample)"
# Use any existing employee id (attempt to use created, fallback to first employee)
$empId = $created.id -or (Invoke-RestMethod -Uri "$base/api/employees" -Method Get | Select-Object -First 1).id
$att = @{ employee_id = $empId; date = (Get-Date -Format 'yyyy-MM-dd'); status = 'present'; note = 'Recorded by PS script' } | ConvertTo-Json
Invoke-RestMethod -Uri "$base/api/attendance" -Method Post -Body $att -ContentType 'application/json' | ConvertTo-Json -Depth 3 | Write-Host

Write-Host "\nDone."
