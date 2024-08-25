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
    ttf-freefont

# Copy thư mục dist vào container
COPY dist ./dist

# Copy file package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt production dependencies
RUN npm install --legacy-peer-deps --only=production

# Thiết lập biến môi trường cho Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PORT=8200
ENV HEADLESS=true

# Chỉ định cổng mà ứng dụng sẽ lắng nghe
EXPOSE 8200

# Command để chạy ứng dụng
CMD ["npm", "run", "start:prod"]
