FROM n8nio/n8n:latest
USER root
COPY docker-entrypoint.sh /init-n8n.sh
RUN chmod +x /init-n8n.sh
USER node
ENTRYPOINT ["tini", "--", "/init-n8n.sh"]