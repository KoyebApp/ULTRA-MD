# Use Node.js 20 based on Alpine
FROM node:20-alpine

# Install required system dependencies, including build tools, image libraries, and other utilities
RUN apk update && \
    apk add --no-cache \
    ffmpeg \
    python3 \
    imagemagick \
    webp \
    curl \
    git \
    sudo \
    npm \
    yarn \
    bash \
    graphicsmagick && \
    rm -rf /var/cache/apk/*

# Install global npm packages
RUN npm install -g supervisor

# Set the working directory inside the container
WORKDIR /app

# Optionally copy your app files and install dependencies
# COPY package*.json /app/
# RUN npm install

# Expose a port (if you intend to run your app with this image later)
EXPOSE 5000

# By default, just leave the image as is without running anything (no CMD here)
