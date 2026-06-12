#!/usr/bin/env bash
# init.sh — agentforge (React + TypeScript + Vite + Firebase + n8n)
# Verificación pre-sesión

info() { echo "ℹ $1"; }
ok()   { echo "✓ $1"; }
warn() { echo "⚠ $1"; }

echo ""; info "agentforge — verificación pre-sesión"

[ -d node_modules ] && ok "node_modules presente" || warn "Falta npm install"
[ -f .env.local ] && ok ".env.local presente" || warn "Falta .env.local (copiar de .env.example)"
git status --short | head -5
npm run build >/dev/null 2>&1 && ok "Build OK" || warn "Build FALLA — revisar antes de tocar nada"
