FROM node:22-alpine
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
COPY frontend/package*.json frontend/
RUN npm install --workspace frontend
COPY frontend frontend
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace", "frontend"]
