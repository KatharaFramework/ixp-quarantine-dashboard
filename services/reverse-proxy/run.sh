#!/bin/sh

# nginx config variable injection
envsubst '$PUBLIC_DOMAIN $FORWARD_PORT $FORWARD_PORT_API' < nginx.conf > /etc/nginx/conf.d/default.conf

if [ "${ENABLE_HTTPS}" = "0" ]; then
    awk '/^server \{/ && n++ {exit} {print}' /etc/nginx/conf.d/default.conf | sed 's/listen 443 ssl;/listen 80;/; /ssl_certificate/d; /ssl_certificate_key/d' > /tmp/nginx_nohttps.conf
    mv /tmp/nginx_nohttps.conf /etc/nginx/conf.d/default.conf
fi

# htpasswd for basic authentication
htpasswd -c -b /etc/nginx/.htpasswd $BASIC_USERNAME $BASIC_PASSWORD

nginx -g "daemon off;"