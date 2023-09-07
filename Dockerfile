# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /geckobotapp
RUN apk --no-cache add python3 make g++ tzdata
COPY . .