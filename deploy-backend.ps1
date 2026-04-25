# deploy-backend.ps1
# NestJS 백엔드 → ECR → hipus Docker
# 확인: https://digo.kr/api/health

if ($PSVersionTable.PSVersion.Major -lt 7) { pwsh -File $MyInvocation.MyCommand.Path @args; exit $LASTEXITCODE }
$ErrorActionPreference = "Stop"

$ECR_REGISTRY  = "419286438275.dkr.ecr.ap-northeast-2.amazonaws.com"
$ECR_IMAGE     = "$ECR_REGISTRY/digo-backend:latest"
$AWS_REGION    = "ap-northeast-2"
$BUILD_CONTEXT = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "backend"

Write-Host "=== deploy-backend ===" -ForegroundColor Cyan
Write-Host "NestJS → ECR → hipus" -ForegroundColor Gray

Write-Host "`n[1/5] Docker 확인..." -ForegroundColor Yellow
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Docker Desktop 실행 필요" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green

Write-Host "`n[2/5] ECR 로그인..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] ECR 로그인 실패" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green

Write-Host "`n[3/5] 빌드... ($BUILD_CONTEXT)" -ForegroundColor Yellow
docker build -t $ECR_IMAGE $BUILD_CONTEXT
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] 빌드 실패" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green

Write-Host "`n[4/5] ECR 푸시..." -ForegroundColor Yellow
docker push $ECR_IMAGE
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] 푸시 실패" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green

Write-Host "`n[5/5] 서버 재시작..." -ForegroundColor Yellow
ssh hipus 'cd ~/apps/digo && /usr/local/bin/aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 419286438275.dkr.ecr.ap-northeast-2.amazonaws.com && docker-compose pull backend && docker-compose up -d --force-recreate backend'
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] 재시작 실패" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green

Write-Host "`n헬스체크..." -ForegroundColor Cyan
$ok = $false
for ($i = 0; $i -lt 15 -and -not $ok; $i++) {
    Start-Sleep -Seconds 3
    $h = ssh hipus 'curl -s http://localhost:3004/api/health 2>/dev/null | grep -q ok && echo ok || echo wait' 2>$null
    if ($h -match "ok") { $ok = $true }
    if ($i % 3 -eq 2) { Write-Host "  대기 중... ($($i*3+3)s)" -ForegroundColor Yellow }
}
ssh hipus 'docker image prune -f' 2>$null

if ($ok) { Write-Host "[OK] healthy" -ForegroundColor Green } else { Write-Host "[WARN] 타임아웃 — 브라우저에서 확인" -ForegroundColor Yellow }
Write-Host "`n=== 완료: https://digo.kr/api/health ===" -ForegroundColor Green
