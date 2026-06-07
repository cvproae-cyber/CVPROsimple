#!/bin/sh
set -e

if [ -n "$PORT" ]; then
    export N8N_PORT="$PORT"
fi

export N8N_PROTOCOL="https"

# استدعاء سكريبت n8n الأصلي الموجود مسبقاً في الصورة
exec /docker-entrypoint.sh "$@"