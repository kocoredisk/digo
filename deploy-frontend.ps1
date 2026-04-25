# deploy-frontend.ps1
# Next.js 프론트엔드 → ECR → hipus Docker
# 확인: https://digo.kr

if ($PSVersionTable.PSVersion.Major -lt 7) { pwsh -File $MyInvocation.MyCommand.Path @args; exit $LASTEXITCODE }
$ErrorActionPreference = "Stop"

$ECR_REGISTRY  = "419286438275.dkr.ecr.ap-northeast-2.amazonaws.com"
$ECR_IMAGE     = "$ECR_REGISTRY/digo-frontend:latest"
$AWS_REGION    = "ap-northeast-2"
$BUILD_CONTEXT = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "frontend"

Write-Host "=== deploy-frontend ===" -ForegroundColor Cyan
Write-Host "Next.js → ECR → hipus" -ForegroundColor Gray

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
ssh hipus 'cd ~/apps/digo && /usr/local/bin/aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 419286438275.dkr.ecr.ap-northeast-2.amazonaws.com && docker-compose pull frontend && docker-compose up -d --force-recreate frontend'
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] 재시작 실패" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green

ssh hipus 'docker image prune -f' 2>$null
Write-Host "`n=== 완료: https://digo.kr ===" -ForegroundColor Green
