FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json backend/
RUN npm install --workspace backend
COPY backend backend
EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "backend"]
