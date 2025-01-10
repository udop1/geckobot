FROM node:18-alpine
WORKDIR /build
COPY package*.json ./
RUN apk add python3 make g++ tzdata && npm install
COPY . .
