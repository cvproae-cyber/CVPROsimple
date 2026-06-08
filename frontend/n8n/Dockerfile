FROM n8nio/n8n:latest
USER root
RUN printf '#!/bin/sh\nset -e\nif [ -n "$PORT" ]; then\n    export N8N_PORT="$PORT"\nfi\nexport N8N_PROTOCOL="https"\nexec /docker-entrypoint.sh "$@"' > /init-n8n.sh && \
    chmod +x /init-n8n.sh
USER node
ENTRYPOINT ["tini", "--", "/init-n8n.sh"]
