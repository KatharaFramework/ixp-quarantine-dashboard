#!/bin/sh

# nginx config variable injection
envsubst '$PUBLIC_DOMAIN $FORWARD_PORT $FORWARD_PORT_API' < nginx.conf > /etc/nginx/conf.d/default.conf

# htpasswd for basic authentication
htpasswd -c -b /etc/nginx/.htpasswd $BASIC_USERNAME $BASIC_PASSWORD

nginx -g "daemon off;"