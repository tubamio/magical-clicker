@echo off
cd /d %~dp0

echo ============================================
echo Ultra Inflate Idle 開発サーバー起動
echo Node.js と npm が必要です
echo ============================================

REM 初回は依存をインストール
if not exist node_modules (
  echo [INFO] node_modules が無いので npm install を実行します...
  call npm install
)

echo [INFO] npm run dev を実行します...
call npm run dev

pause
