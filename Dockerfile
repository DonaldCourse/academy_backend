FROM node:15.3.0-alpine as builder

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

EXPOSE 5000
CMD [ "npm", "start" ]