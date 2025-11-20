# Use an official Node.js image
FROM node:24-alpine3.21

# Set working directory
WORKDIR /app/p_solicitante

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the files
COPY . .

ARG LOAD_MANAGER_HOST
ARG LOAD_MANAGER_PORT
ARG CATALOG_SERVICE_URL
ARG SEDE

RUN echo "LOAD_MANAGER_HOST=${LOAD_MANAGER_HOST}" > .env \
  && echo "LOAD_MANAGER_PORT=${LOAD_MANAGER_PORT}" >> .env \
  && echo "SEDE=${SEDE}" >> .env \
  && echo "CATALOG_SERVICE_URL=${CATALOG_SERVICE_URL}" >> .env

# Esto hace que no sea un servicio, sino una app de docker
ENTRYPOINT ["node", "index.ts"]