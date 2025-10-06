# Use an official Node.js image
FROM node:24-alpine3.21

# Set working directory
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Esto hace que no sea un servicio, sino una app de docker
ENTRYPOINT ["node", "index.ts"]