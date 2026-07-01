#!/usr/bin/env bash
set -euo pipefail

HOOK_PATH=".git/hooks/pre-commit"

if [ ! -d ".git" ]; then
  echo "ERROR: this script must be executed at the root of a Git repository."
  exit 1
fi

cat > "$HOOK_PATH" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

./scripts/pre-commit-security-check.sh
HOOK

chmod +x "$HOOK_PATH"

echo "Pre-commit hook installed successfully at $HOOK_PATH"
