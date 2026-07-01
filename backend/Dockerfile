FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER_RUN=true

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

USER node

EXPOSE 3000

CMD ["npm", "start"]
