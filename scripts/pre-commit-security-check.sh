#!/usr/bin/env bash
set -euo pipefail

echo "Security check: starting pre-commit controls..."

BLOCKED_FILES_REGEX='(^|/)(\.env|\.env\..*|.*\.pem|.*\.key|.*\.p12|.*\.pfx|.*\.agekey)$'

STAGED_FILES=$(git diff --cached --name-only)

if [ -z "$STAGED_FILES" ]; then
  echo "Security check: no staged files."
  exit 0
fi

echo "Security check: checking blocked file names..."

if echo "$STAGED_FILES" | grep -E "$BLOCKED_FILES_REGEX" >/dev/null 2>&1; then
  echo "ERROR: blocked sensitive file detected in staged files."
  echo ""
  echo "$STAGED_FILES" | grep -E "$BLOCKED_FILES_REGEX" || true
  echo ""
  echo "Do not commit .env, private keys, certificates or local secret files."
  exit 1
fi

echo "Security check: checking SECWALLET tokens in added lines only..."

if git diff --cached -U0 | grep '^+' | grep -v '^+++' | grep -E 'SECWALLET_[A-Z0-9]{24}' >/dev/null 2>&1; then
  echo "ERROR: SECWALLET token detected in added staged changes."
  echo "Remove the secret before committing."
  exit 1
fi

echo "Security check: checking common private key markers in added lines only..."

if git diff --cached -U0 | grep '^+' | grep -v '^+++' | grep -E '-----BEGIN (RSA |OPENSSH |EC |DSA |)?PRIVATE KEY-----' >/dev/null 2>&1; then
  echo "ERROR: private key detected in added staged changes."
  echo "Remove the private key before committing."
  exit 1
fi

if command -v gitleaks >/dev/null 2>&1; then
  echo "Security check: running Gitleaks..."
  gitleaks detect \
    --source . \
    --config security/gitleaks/gitleaks.toml \
    --no-git \
    --redact
else
  echo "WARNING: gitleaks is not installed locally."
  echo "Install it if possible, or rely on the GitHub Actions scan later."
fi

echo "Security check: passed."
