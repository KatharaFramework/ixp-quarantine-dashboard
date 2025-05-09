FROM nginx:1.19

# Install apache2-utils to get htpasswd command
RUN apt-get update -y && apt-get install -y apache2-utils && rm -rf /var/lib/apt/lists/*

# Nginx config file
WORKDIR /
COPY nginx.conf nginx.conf
COPY certs /root/certs

# Startup script
COPY run.sh ./
RUN chmod 0755 ./run.sh
CMD [ "./run.sh" ]