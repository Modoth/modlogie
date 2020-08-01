FROM nginx
COPY app /usr/share/nginx/html
COPY docker/default.conf /etc/nginx/conf.d/
COPY docker/cert.pem /etc/nginx/
COPY docker/cert.key /etc/nginx/