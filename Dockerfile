# Use the official Node.js image as the base image
FROM node:20.10.0

# Set the working directory
WORKDIR /app

# Copy files from your computer into the image
COPY . .

# Install the dependencies
RUN npm install

# Specifies what command to run within the container
CMD ["npm", "run", "start"]

# Indicates that the container will listen on port 3000
EXPOSE 3000