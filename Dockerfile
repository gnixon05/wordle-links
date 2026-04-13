FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY dist ./dist
COPY server ./server
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["npx", "tsx", "server/index.ts"]
