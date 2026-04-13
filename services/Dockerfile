FROM node:lts-alpine AS frontend-builder

WORKDIR /app
COPY frontend /app/

ENV VITE_API_URL=/api

RUN npm install
RUN npm run build

FROM nginx:1.29

# Install apache2-utils to get htpasswd command
RUN apt-get update -y && apt-get install -y apache2-utils && rm -rf /var/lib/apt/lists/*

# Nginx config file
WORKDIR /
COPY reverse-proxy/nginx.conf nginx.conf
COPY reverse-proxy/certs /root/certs
COPY --from=frontend-builder /app/dist/ /var/www/
RUN mkdir -p /var/www/public
COPY --from=frontend-builder /app/public/ /var/www/public

# Startup script
COPY reverse-proxy/run.sh ./
RUN chmod 0755 ./run.sh
CMD [ "./run.sh" ]