#!/bin/bash
# hipus 서버 배포 스크립트
# 실행: bash deploy.sh

set -e

DEPLOY_DIR="/home/ec2-user/digo"
REPO="E:/AA.Project/600_Digo"  # 로컬 경로 (scp용)

echo "=== Digo 배포 시작 ==="

# 1. 디렉토리 준비
mkdir -p $DEPLOY_DIR/backend
mkdir -p $DEPLOY_DIR/frontend

# 2. backend 빌드 결과 + package.json 복사 (로컬에서 scp)
# scp -r ./backend/dist ec2-user@15.165.80.153:$DEPLOY_DIR/backend/
# scp ./backend/package.json ec2-user@15.165.80.153:$DEPLOY_DIR/backend/
# scp ./backend/.env.production ec2-user@15.165.80.153:$DEPLOY_DIR/backend/.env

# 3. frontend 빌드 결과 복사
# scp -r ./frontend/.next ec2-user@15.165.80.153:$DEPLOY_DIR/frontend/
# scp ./frontend/package.json ec2-user@15.165.80.153:$DEPLOY_DIR/frontend/
# scp ./frontend/.env.production ec2-user@15.165.80.153:$DEPLOY_DIR/frontend/.env.production

# 4. 서버에서 의존성 설치
cd $DEPLOY_DIR/backend && npm install --production
cd $DEPLOY_DIR/frontend && npm install --production

# 5. PM2 재시작
pm2 startOrRestart /home/ec2-user/digo/deploy/ecosystem.config.js --env production
pm2 save

echo "=== 배포 완료 ==="
pm2 list
