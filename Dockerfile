# Use a base image from Quay
FROM quay.io/globaltechinfo/umd:latest

# Clone the repository (you could also copy the app if you already have it locally)
RUN git clone https://github.com/GlobalTechInfo/ULTRA-MD /root/qasim

# Remove .git directory to reduce image size
RUN rm -rf /root/qasim/.git

# Set the working directory
WORKDIR /root/qasim

# Install dependencies (using npm or yarn)
RUN npm install || yarn install

# Expose port 5000
EXPOSE 5000

# Define the start command
CMD ["npm", "start"]
