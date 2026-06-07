FROM n8nio/n8n:latest
USER root
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
USER node
ENTRYPOINT ["tini", "--", "/docker-entrypoint.sh"]