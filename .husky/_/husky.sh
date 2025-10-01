#!/usr/bin/env sh
if [ -z "$HUSKY" ]; then
  script="$0"
  while [ -h "$script" ]; do
    script="$(readlink "$script")"
  done
  dir="$(cd "$(dirname "$script")/.." >/dev/null 2>&1 && pwd -P)"
  export HUSKY=1
  . "$dir/node_modules/husky/lib/init.sh" "$@"
fi