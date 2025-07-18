FROM node:23-alpine
WORKDIR /build
COPY package*.json ./
RUN apk --no-cache add g++ make python3 tzdata && npm install
COPY . .
CMD [ "npm", "run", "start" ]
