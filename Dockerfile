# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /geckobotapp
COPY package*.json ./
RUN apk add python3 make g++ tzdata && npm install
COPY . .