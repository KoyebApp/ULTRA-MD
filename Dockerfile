# Use Node.js LTS based on Debian Buster
FROM node:lts-buster

# Install required system dependencies, including build tools, image libraries, and other utilities
RUN apt-get update && \
    apt-get install -y \
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
    graphicsmagick \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g supervisor

# Set the working directory inside the container
WORKDIR /qasim

# Copy your app files and install dependencies
COPY package*.json /qasim/
RUN npm install

# Expose a port (if you intend to run your app with this image later)
EXPOSE 5000

# Optionally set a default command to run the app
CMD ["npm", "start"]
