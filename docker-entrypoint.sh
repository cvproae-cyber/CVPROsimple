#!/bin/sh
set -e
if [ -n "$PORT" ]; then
    export N8N_PORT="$PORT"
fi
export N8N_PROTOCOL="https"
if [ -n "$N8N_HOST" ]; then
    export WEBHOOK_URL="https://${N8N_HOST}"
fi
exec /docker-entrypoint.sh "$@"