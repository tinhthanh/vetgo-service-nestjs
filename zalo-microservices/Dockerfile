# Sử dụng Node.js phiên bản LTS (long-term support) làm base image
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt Chromium và các gói cần thiết khác
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    xvfb \
    x11vnc \
    fluxbox \
    bash \
    git \
    supervisor \
    nginx

RUN mkdir -p /var/log/supervisor && \
    chmod 755 /var/log/supervisor

# Cài đặt noVNC
RUN git clone https://github.com/novnc/noVNC.git /opt/novnc && \
    git clone https://github.com/novnc/websockify /opt/websockify && \
    ln -s /opt/websockify /opt/novnc/utils/websockify && \
    chmod +x /opt/novnc/utils/novnc_proxy

# Copy thư mục dist vào container
COPY dist/apps/chrome-profile ./dist

# Copy file package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt production dependencies
RUN npm install --legacy-peer-deps --only=production

# Thiết lập biến môi trường cho Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DISPLAY=:1
ENV PORT=9401
ENV WS=https://socketonly.moonpet.vn/ws
ENV HEADLESS=false
ENV REALM=vetgo-zl
ENV URL_CURD=https://api.moonpet.vn

# Copy file cấu hình supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy file cấu hình nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Command để khởi động supervisor và chạy noVNC, x11vnc, nginx
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Chỉ định cổng mà ứng dụng sẽ lắng nghe
EXPOSE 9401 9400 6080
