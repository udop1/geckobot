FROM node:23-alpine
WORKDIR /build
COPY package*.json ./
RUN apk --no-cache add ffmpeg g++ make python3 tzdata && npm ci --omit=dev && npm cache clean --force
COPY . .
CMD [ "node", "." ]