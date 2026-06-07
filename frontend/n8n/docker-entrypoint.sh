#!/bin/sh
set -e
if [ -n "$PORT" ]; then
    export N8N_PORT="$PORT"
fi
export N8N_PROTOCOL="https"
exec /docker-entrypoint.sh "$@"